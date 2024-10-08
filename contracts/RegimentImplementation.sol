import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Proxy.sol";

pragma solidity 0.8.9;

contract RegimentImplementation is ProxyStorage {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint256;
    address private controller;
    uint256 private memberJoinLimit;
    uint256 private regimentLimit;
    uint256 private maximumAdminsCount;
    uint256 public regimentCount;

    uint256 public constant DefaultMemberJoinLimit = 256;
    uint256 public constant DefaultRegimentLimit = 1024;
    uint256 public constant DefaultMaximumAdminsCount = 3;

    mapping(bytes32 => RegimentInfo) private regimentInfoMap;
    mapping(bytes32 => EnumerableSet.AddressSet) private regimentMemberListMap;

    struct RegimentInfo {
        uint256 createTime;
        address manager;
        EnumerableSet.AddressSet admins;
    }
    struct RegimentInfoForView {
        uint256 createTime;
        address manager;
        address[] admins;
    }
    modifier assertSenderIsController() {
        require(msg.sender == controller, "Sender is not the Controller.");
        _;
    }

    event RegimentCreated(
        uint256 createTime,
        address manager,
        address[] initialMemberList,
        bytes32 regimentId
    );

    event NewMemberAdded(bytes32 regimentId, address newMemberAddress);
    event RegimentMemberLeft(bytes32 regimentId, address leftMemberAddress);

    function initialize(
        uint256 _memberJoinLimit,
        uint256 _regimentLimit,
        uint256 _maximumAdminsCount
    ) external onlyOwner {
        require(controller == address(0), "already initialized");
        require(
            _memberJoinLimit <= DefaultMemberJoinLimit,
            "Invalid memberJoinLimit"
        );
        require(
            _regimentLimit <= DefaultRegimentLimit,
            "Invalid regimentLimit"
        );
        require(
            _maximumAdminsCount <= DefaultMaximumAdminsCount,
            "Invalid maximumAdminsCount"
        );
        controller = msg.sender;
        memberJoinLimit = _memberJoinLimit <= 0
            ? DefaultMemberJoinLimit
            : _memberJoinLimit;
        regimentLimit = _regimentLimit <= 0
            ? DefaultRegimentLimit
            : _regimentLimit;
        maximumAdminsCount = _maximumAdminsCount <= 0
            ? DefaultMaximumAdminsCount
            : _maximumAdminsCount;
    }

    function CreateRegiment(
        address manager,
        address[] calldata initialMemberList
    ) external assertSenderIsController returns (bytes32) {
        require(manager != address(0), "invalid address.");
        bytes32 regimentId = sha256(abi.encodePacked(regimentCount, manager));
        regimentCount = regimentCount.add(1);
        EnumerableSet.AddressSet storage memberList = regimentMemberListMap[
            regimentId
        ];
        for (uint256 i; i < initialMemberList.length; i++) {
            require(initialMemberList[i] != address(0), "invalid member");
            memberList.add(initialMemberList[i]);
        }
        if (!memberList.contains(manager)) {
            memberList.add(manager);
        }
        require(
            memberList.length() <= memberJoinLimit,
            "Too many initial members."
        );
        regimentInfoMap[regimentId].createTime = block.timestamp;
        regimentInfoMap[regimentId].manager = manager;

        emit RegimentCreated(
            block.timestamp,
            manager,
            initialMemberList,
            regimentId
        );
        return regimentId;
    }

    function AddRegimentMember(
        bytes32 regimentId,
        address newMemberAddress
    ) external {
        require(newMemberAddress != address(0),'invalid input');
        RegimentInfo storage regimentInfo = regimentInfoMap[regimentId];
        EnumerableSet.AddressSet storage memberList = regimentMemberListMap[
            regimentId
        ];
        require(
            memberList.length() < memberJoinLimit,
            "Regiment member reached the limit"
        );
        require(
            regimentInfo.manager == msg.sender,
            "Origin sender is not manager of this regiment"
        );
        require(!memberList.contains(newMemberAddress), "member already added");
        memberList.add(newMemberAddress);
        emit NewMemberAdded(regimentId, newMemberAddress);
    }

    function DeleteRegimentMember(
        bytes32 regimentId,
        address leaveMemberAddress
    ) external {
        RegimentInfo storage regimentInfo = regimentInfoMap[regimentId];
        EnumerableSet.AddressSet storage memberList = regimentMemberListMap[
            regimentId
        ];
        require(
            regimentInfo.manager == msg.sender,
            "Origin sender is not manager of this regiment"
        );
        require(
            memberList.contains(leaveMemberAddress),
            "member already leaved"
        );
        require(leaveMemberAddress != regimentInfo.manager,"Manager cannot be removed from the regiment");
        memberList.remove(leaveMemberAddress);
        emit RegimentMemberLeft(regimentId, leaveMemberAddress);
    }

    function ChangeController(
        address _controller
    ) external assertSenderIsController {
        require(_controller != address(0),"invalid input");
        controller = _controller;
    }

    function ResetConfig(
        uint256 _memberJoinLimit,
        uint256 _regimentLimit,
        uint256 _maximumAdminsCount
    ) external assertSenderIsController {
        require(
            _memberJoinLimit <= DefaultMemberJoinLimit,
            "Invalid memberJoinLimit"
        );
        require(
            _regimentLimit <= DefaultRegimentLimit,
            "Invalid regimentLimit"
        );
        require(
            _maximumAdminsCount <= DefaultMaximumAdminsCount,
            "Invalid maximumAdminsCount"
        );
        memberJoinLimit = _memberJoinLimit <= 0
            ? memberJoinLimit
            : _memberJoinLimit;
        regimentLimit = _regimentLimit <= 0 ? regimentLimit : _regimentLimit;
        maximumAdminsCount = _maximumAdminsCount <= 0
            ? maximumAdminsCount
            : _maximumAdminsCount;
        require(memberJoinLimit <= regimentLimit, "Incorrect MemberJoinLimit.");
    }

    function TransferRegimentOwnership(
        bytes32 regimentId,
        address newManagerAddress
    ) external {
        RegimentInfo storage regimentInfo = regimentInfoMap[regimentId];
        require(msg.sender == regimentInfo.manager, "no permission");
        require(newManagerAddress != address(0), "invalid manager address");
        EnumerableSet.AddressSet storage memberList = regimentMemberListMap[
            regimentId
        ];
        require(
            memberList.contains(regimentInfo.manager) && !memberList.contains(newManagerAddress),
            "invalid manager."
        );
        memberList.remove(regimentInfo.manager);
        memberList.add(newManagerAddress);
        regimentInfo.manager = newManagerAddress;
    }

    function AddAdmins(
        bytes32 regimentId,
        address[] calldata newAdmins
    ) external {
        RegimentInfo storage regimentInfo = regimentInfoMap[regimentId];
        require(msg.sender == regimentInfo.manager, "No permission.");
        for (uint256 i; i < newAdmins.length; i++) {
            require(newAdmins[i] != address(0), "invalid admin");
            require(
                !regimentInfo.admins.contains(newAdmins[i]),
                "someone is already an admin"
            );
            regimentInfo.admins.add(newAdmins[i]);
        }
        require(
            regimentInfo.admins.length() <= maximumAdminsCount,
            "Admins count cannot greater than maximumAdminsCount"
        );
    }

    function DeleteAdmins(
        bytes32 regimentId,
        address[] calldata deleteAdmins
    ) external {
        RegimentInfo storage regimentInfo = regimentInfoMap[regimentId];
        require(msg.sender == regimentInfo.manager, "No permission.");
        for (uint256 i; i < deleteAdmins.length; i++) {
            require(
                regimentInfo.admins.contains(deleteAdmins[i]),
                "someone is not an admin"
            );
            regimentInfo.admins.remove(deleteAdmins[i]);
        }
    }

    //view functions

    function GetController() external view returns (address) {
        return controller;
    }

    function GetConfig() external view returns (uint256, uint256, uint256) {
        return (memberJoinLimit, regimentLimit, maximumAdminsCount);
    }

    function GetRegimentInfo(
        bytes32 regimentId
    ) external view returns (RegimentInfoForView memory) {
        RegimentInfo storage regimentInfo = regimentInfoMap[regimentId];
        return
            RegimentInfoForView({
                createTime: regimentInfo.createTime,
                manager: regimentInfo.manager,
                admins: regimentInfo.admins.values()
            });
    }

    function IsRegimentMember(
        bytes32 regimentId,
        address memberAddress
    ) external view returns (bool) {
        EnumerableSet.AddressSet storage memberList = regimentMemberListMap[
            regimentId
        ];
        return memberList.contains(memberAddress);
    }

    function IsRegimentMembers(
        bytes32 regimentId,
        address[] memory memberAddress
    ) external view returns (bool) {
        EnumerableSet.AddressSet storage memberList = regimentMemberListMap[
            regimentId
        ];
        //require no Duplicates
        for (uint256 i = 0; i < memberAddress.length; i++) {
            for (uint256 j = i; j < memberAddress.length - 1; j++) {
                require(
                    memberAddress[i] != memberAddress[j + 1],
                    "Duplicate input"
                );
            }
            if (memberList.contains(memberAddress[i])) continue;
            else return false;
        }
        return true;
    }

    function IsRegimentAdmin(
        bytes32 regimentId,
        address adminAddress
    ) external view returns (bool) {
        RegimentInfo storage regimentInfo = regimentInfoMap[regimentId];
        require(regimentInfo.manager != address(0), "Invalid regimentId");
        return regimentInfo.admins.contains(adminAddress);
    }

    function IsRegimentManager(
        bytes32 regimentId,
        address managerAddress
    ) external view returns (bool) {
        RegimentInfo storage regimentInfo = regimentInfoMap[regimentId];
        return regimentInfo.manager == managerAddress;
    }

    function GetRegimentMemberList(
        bytes32 regimentId
    ) external view returns (address[] memory) {
        EnumerableSet.AddressSet storage memberList = regimentMemberListMap[
            regimentId
        ];
        return memberList.values();
    }
}
