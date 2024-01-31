// var WETH9 = artifacts.require("WETH9");
// var USDT = artifacts.require("USDT");
// var ELF = artifacts.require("ELF");
// var WBNB = artifacts.require("WBNB");

// var MultiSigWallet = artifacts.require("MultiSigWallet");
// var BridgeOutLibrary = artifacts.require("BridgeOutLibrary");
// var Timelock = artifacts.require("Timelock");

// var BridgeIn = artifacts.require("BridgeIn");
// var BridgeInImplementation = artifacts.require("BridgeInImplementation");
// var BridgeOut = artifacts.require("BridgeOut");
// var BridgeOutImplementationV1 = artifacts.require("BridgeOutImplementationV1");
// var Regiment = artifacts.require("Regiment");
// var RegimentImplementation = artifacts.require("RegimentImplementation");
// var MerkleTree = artifacts.require("MerkleTree");
// var MerkleTreeImplementation = artifacts.require("MerkleTreeImplementation");
async function initialize() {

  const Web3 = require('web3');
  const crypto = require('crypto');
  const TronWeb = require('tronweb')
  var privateKey = crypto.randomBytes(32).toString('hex');
  console.log("Private Key", privateKey);

  const tronWeb = new TronWeb({
    fullHost: 'https://nile.trongrid.io',
    headers: { "TRON-PRO-API-KEY": 'bb9a7a1e-9bb5-4807-a4ba-6d0813a9b7f7' },
    privateKey: "0000000000000000000000000000000000000000000000000000000000000001"
  })

  const senderAddress = "418e760eccfeae90e2c6b6d9f576d87bb8057754dc";
  const account1 = "TNxUP6jngXG5XqpKAFBWsu3TDNv6nWJL7m";
  const account2 = "TNxUP6jngXG5XqpKAFBWsu3TDNv6nWJL7m";
  const account3 = "TNxUP6jngXG5XqpKAFBWsu3TDNv6nWJL7m";
  const account4 = "TNxUP6jngXG5XqpKAFBWsu3TDNv6nWJL7m";
  const account5 = "TNxUP6jngXG5XqpKAFBWsu3TDNv6nWJL7m";

  const elfAddress = "41ea4f9a8f4c15c97aa4568f933ee513ae7d80ad81";
  const usdtAddress = "41e7122ea19f9324206b303047e3ba30259c45c990";

  const RegimentAddress = '41b60f4233b23ade83609dc436532a283c3463c93a';
  const BridgeInAddress = '41f6be4af14c54b3aa47dd1c3d8171492b90731a38';
  const BridgeOutAddress = '41856fd68205317d9023b1158f5dfc4876830c8f27';
  const LimiterAddress = '41d689c2170d29c9ad74dd46dd53b849d3b32c6fb3';
  const MultiSigWalletAddress = '411eafefb15b3fe765ecf948f80b56939896a08e18';
  const MerkleTreeAddress = '419b8c49dcf0cb0dd6b8581121ddbe47e20bb5098b';

  var SlideChainId = "SideChain_tDVV";
  var MainChainId = "MainChain_AELF";

  // regimentImplementation contract
  var abiRegimentImplementation = [{
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "indexed": false,
      "internalType": "address",
      "name": "newMemberAddress",
      "type": "address"
    }],
    "name": "NewMemberAdded",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "previousOwner",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }],
    "name": "OwnershipTransferred",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "uint256",
      "name": "createTime",
      "type": "uint256"
    }, {
      "indexed": false,
      "internalType": "address",
      "name": "manager",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "address[]",
      "name": "initialMemberList",
      "type": "address[]"
    }, {
      "indexed": false,
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }],
    "name": "RegimentCreated",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "indexed": false,
      "internalType": "address",
      "name": "leftMemberAddress",
      "type": "address"
    }],
    "name": "RegimentMemberLeft",
    "type": "event"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "internalType": "address[]",
      "name": "newAdmins",
      "type": "address[]"
    }],
    "name": "AddAdmins",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "internalType": "address",
      "name": "newMemberAddress",
      "type": "address"
    }],
    "name": "AddRegimentMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "_controller",
      "type": "address"
    }],
    "name": "ChangeController",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "manager",
      "type": "address"
    }, {
      "internalType": "address[]",
      "name": "initialMemberList",
      "type": "address[]"
    }],
    "name": "CreateRegiment",
    "outputs": [{
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "DefaultMaximumAdminsCount",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "DefaultMemberJoinLimit",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "DefaultRegimentLimit",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "internalType": "address[]",
      "name": "deleteAdmins",
      "type": "address[]"
    }],
    "name": "DeleteAdmins",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "internalType": "address",
      "name": "leaveMemberAddress",
      "type": "address"
    }],
    "name": "DeleteRegimentMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "GetConfig",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "GetController",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }],
    "name": "GetRegimentInfo",
    "outputs": [{
      "components": [{
        "internalType": "uint256",
        "name": "createTime",
        "type": "uint256"
      }, {
        "internalType": "address",
        "name": "manager",
        "type": "address"
      }, {
        "internalType": "address[]",
        "name": "admins",
        "type": "address[]"
      }],
      "internalType": "struct RegimentImplementation.RegimentInfoForView",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }],
    "name": "GetRegimentMemberList",
    "outputs": [{
      "internalType": "address[]",
      "name": "",
      "type": "address[]"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "internalType": "address",
      "name": "adminAddress",
      "type": "address"
    }],
    "name": "IsRegimentAdmin",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "internalType": "address",
      "name": "managerAddress",
      "type": "address"
    }],
    "name": "IsRegimentManager",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "internalType": "address",
      "name": "memberAddress",
      "type": "address"
    }],
    "name": "IsRegimentMember",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "internalType": "address[]",
      "name": "memberAddress",
      "type": "address[]"
    }],
    "name": "IsRegimentMembers",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "_memberJoinLimit",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "_regimentLimit",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "_maximumAdminsCount",
      "type": "uint256"
    }],
    "name": "ResetConfig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "regimentId",
      "type": "bytes32"
    }, {
      "internalType": "address",
      "name": "newManagerAddress",
      "type": "address"
    }],
    "name": "TransferRegimentOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "_memberJoinLimit",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "_regimentLimit",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "_maximumAdminsCount",
      "type": "uint256"
    }],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "owner",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "regimentCount",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }];
  var regimentImplementation = tronWeb.contract(abiRegimentImplementation, RegimentAddress);
  // let contract = await RegimentImplementation.deployed();

  // bridgeOutImplementationV1 contract
  var abibridgeOutImplementationV1 = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "swapId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "transmiter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "receiptIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "receiptHash",
          "type": "bytes32"
        }
      ],
      "name": "NewTransmission",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "swapId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "chainId",
          "type": "string"
        }
      ],
      "name": "SwapPairAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "receiveAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokenSwapEvent",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MaxQueryRange",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MaxTokenKeyCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "receiptId",
          "type": "string"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "approveController",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bridgeIn",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_approveController",
          "type": "address"
        }
      ],
      "name": "changeApproveController",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_multiSigWallet",
          "type": "address"
        }
      ],
      "name": "changeMultiSignWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "fromChainId",
              "type": "string"
            },
            {
              "internalType": "uint64",
              "name": "originShare",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "targetShare",
              "type": "uint64"
            }
          ],
          "internalType": "struct BridgeOutImplementationV1.SwapTargetToken",
          "name": "targetToken",
          "type": "tuple"
        },
        {
          "internalType": "bytes32",
          "name": "regimentId",
          "type": "bytes32"
        }
      ],
      "name": "createSwap",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "defaultMerkleTreeDepth",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "tokenKey",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "swapId",
          "type": "bytes32"
        }
      ],
      "name": "getDepositAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        },
        {
          "internalType": "string[]",
          "name": "fromChainIds",
          "type": "string[]"
        }
      ],
      "name": "getReceiveReceiptIndex",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "fromChainId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "fromIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endIndex",
          "type": "uint256"
        }
      ],
      "name": "getReceivedReceiptInfos",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "asset",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "targetAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "blockHeight",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "blockTime",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "fromChainId",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "receiptId",
              "type": "string"
            }
          ],
          "internalType": "struct BridgeOutImplementationV1.ReceivedReceipt[]",
          "name": "_receipts",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "fromChainId",
          "type": "string"
        }
      ],
      "name": "getSwapId",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "swapId",
          "type": "bytes32"
        }
      ],
      "name": "getSwapInfo",
      "outputs": [
        {
          "internalType": "string",
          "name": "fromChainId",
          "type": "string"
        },
        {
          "internalType": "bytes32",
          "name": "regimentId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_merkleTree",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_regiment",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_bridgeIn",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_approveController",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_multiSigWallet",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "receiptHash",
          "type": "bytes32"
        }
      ],
      "name": "isReceiptRecorded",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "limiter",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "multiSigWallet",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "regiment",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "restart",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_defaultMerkleTreeDepth",
          "type": "uint256"
        }
      ],
      "name": "setDefaultMerkleTreeDepth",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_limiter",
          "type": "address"
        }
      ],
      "name": "setLimiter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "_signatureThreshold",
          "type": "uint8"
        }
      ],
      "name": "setSignatureThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "signatureThreshold",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "swapId",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "receiptId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "receiverAddress",
          "type": "address"
        }
      ],
      "name": "swapToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tokenAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "tokenAmountLimit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "swapHashId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "_report",
          "type": "bytes"
        },
        {
          "internalType": "bytes32[]",
          "name": "_rs",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes32[]",
          "name": "_ss",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes32",
          "name": "_rawVs",
          "type": "bytes32"
        }
      ],
      "name": "transmit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "tokenKey",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  var bridgeOutImplementationV1 = tronWeb.contract(abibridgeOutImplementationV1, BridgeOutAddress);

  // bridgeOutImplementationV1 contract
  var abibridgeInImplementation = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "receiptId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "NewReceipt",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "chainId",
          "type": "string"
        }
      ],
      "name": "TokenAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "chainId",
          "type": "string"
        }
      ],
      "name": "TokenRemoved",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MaxQueryRange",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MaxTokenCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MaxTokenCountPerAddOrRemove",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "tokenAddress",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "chainId",
              "type": "string"
            }
          ],
          "internalType": "struct BridgeInImplementation.Token[]",
          "name": "tokens",
          "type": "tuple[]"
        }
      ],
      "name": "addToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bridgeOut",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_wallet",
          "type": "address"
        }
      ],
      "name": "changeMultiSignWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_pauseController",
          "type": "address"
        }
      ],
      "name": "changePauseController",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "targetChainId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "targetAddress",
          "type": "string"
        }
      ],
      "name": "createNativeTokenReceipt",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "targetChainId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "targetAddress",
          "type": "string"
        }
      ],
      "name": "createReceipt",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "tokenKey",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "depositAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "targetChainId",
          "type": "string"
        }
      ],
      "name": "getMyReceipts",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "receipt_ids",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        },
        {
          "internalType": "string[]",
          "name": "targetChainIds",
          "type": "string[]"
        }
      ],
      "name": "getSendReceiptIndex",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "indexes",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "targetChainId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "fromIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endIndex",
          "type": "uint256"
        }
      ],
      "name": "getSendReceiptInfos",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "asset",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "blockHeight",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "blockTime",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "targetChainId",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "targetAddress",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "receiptId",
              "type": "string"
            }
          ],
          "internalType": "struct BridgeInImplementation.Receipt[]",
          "name": "_receipts",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "chainId",
          "type": "string"
        }
      ],
      "name": "getTotalAmountInReceipts",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_multiSigWallet",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_pauseController",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isPaused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "chainId",
          "type": "string"
        }
      ],
      "name": "isSupported",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "limiter",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "multiSigWallet",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pauseController",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "tokenAddress",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "chainId",
              "type": "string"
            }
          ],
          "internalType": "struct BridgeInImplementation.Token[]",
          "name": "tokens",
          "type": "tuple[]"
        }
      ],
      "name": "removeToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "restart",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_bridgeOut",
          "type": "address"
        }
      ],
      "name": "setBridgeOut",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_limiter",
          "type": "address"
        }
      ],
      "name": "setLimiter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tokenAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "tokenKey",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "receiverAddress",
          "type": "address"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  var bridgeInImplementation = tronWeb.contract(abibridgeInImplementation, BridgeInAddress);

  // bridgeOutImplementationV1 contract
  var abiLimiterImplementation = [
    {
      "inputs": [],
      "name": "BucketOverfilled",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "dailyLimit",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "DailyLimitExceeded",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "capacity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "MaxCapacityExceeded",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "minWaitInSeconds",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "available",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        }
      ],
      "name": "TokenRateLimitReached",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bridgeIn",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bridgeOut",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_admin",
          "type": "address"
        }
      ],
      "name": "changeAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "dailyLimitId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "consumeDailyLimit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "bucketId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "consumeTokenBucket",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "targetChainId",
          "type": "string"
        }
      ],
      "name": "getCurrentReceiptTokenBucketState",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint128",
              "name": "currentTokenAmount",
              "type": "uint128"
            },
            {
              "internalType": "uint32",
              "name": "lastUpdatedTime",
              "type": "uint32"
            },
            {
              "internalType": "bool",
              "name": "isEnabled",
              "type": "bool"
            },
            {
              "internalType": "uint128",
              "name": "tokenCapacity",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "rate",
              "type": "uint128"
            }
          ],
          "internalType": "struct RateLimiter.TokenBucket",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        },
        {
          "internalType": "string[]",
          "name": "targetChainIds",
          "type": "string[]"
        }
      ],
      "name": "getCurrentReceiptTokenBucketStates",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint128",
              "name": "currentTokenAmount",
              "type": "uint128"
            },
            {
              "internalType": "uint32",
              "name": "lastUpdatedTime",
              "type": "uint32"
            },
            {
              "internalType": "bool",
              "name": "isEnabled",
              "type": "bool"
            },
            {
              "internalType": "uint128",
              "name": "tokenCapacity",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "rate",
              "type": "uint128"
            }
          ],
          "internalType": "struct RateLimiter.TokenBucket[]",
          "name": "_tokenBuckets",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "fromChainId",
          "type": "string"
        }
      ],
      "name": "getCurrentSwapTokenBucketState",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint128",
              "name": "currentTokenAmount",
              "type": "uint128"
            },
            {
              "internalType": "uint32",
              "name": "lastUpdatedTime",
              "type": "uint32"
            },
            {
              "internalType": "bool",
              "name": "isEnabled",
              "type": "bool"
            },
            {
              "internalType": "uint128",
              "name": "tokenCapacity",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "rate",
              "type": "uint128"
            }
          ],
          "internalType": "struct RateLimiter.TokenBucket",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        },
        {
          "internalType": "string[]",
          "name": "fromChainIds",
          "type": "string[]"
        }
      ],
      "name": "getCurrentSwapTokenBucketStates",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint128",
              "name": "currentTokenAmount",
              "type": "uint128"
            },
            {
              "internalType": "uint32",
              "name": "lastUpdatedTime",
              "type": "uint32"
            },
            {
              "internalType": "bool",
              "name": "isEnabled",
              "type": "bool"
            },
            {
              "internalType": "uint128",
              "name": "tokenCapacity",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "rate",
              "type": "uint128"
            }
          ],
          "internalType": "struct RateLimiter.TokenBucket[]",
          "name": "_tokenBuckets",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "targetChainId",
          "type": "string"
        }
      ],
      "name": "getReceiptBucketMinWaitSeconds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "targetChainId",
          "type": "string"
        }
      ],
      "name": "getReceiptDailyLimit",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "tokenAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint32",
              "name": "refreshTime",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "defaultTokenAmount",
              "type": "uint256"
            }
          ],
          "internalType": "struct DailyLimiter.DailyLimitTokenInfo",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "fromChainId",
          "type": "string"
        }
      ],
      "name": "getSwapBucketMinWaitSeconds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "swapId",
          "type": "bytes32"
        }
      ],
      "name": "getSwapDailyLimit",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "tokenAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint32",
              "name": "refreshTime",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "defaultTokenAmount",
              "type": "uint256"
            }
          ],
          "internalType": "struct DailyLimiter.DailyLimitTokenInfo",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_bridgeIn",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_bridgeOut",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_admin",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "dailyLimitId",
              "type": "bytes32"
            },
            {
              "internalType": "uint32",
              "name": "refreshTime",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "defaultTokenAmount",
              "type": "uint256"
            }
          ],
          "internalType": "struct DailyLimiter.DailyLimitConfig[]",
          "name": "dailyLimitConfigs",
          "type": "tuple[]"
        }
      ],
      "name": "setDailyLimit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "bucketId",
              "type": "bytes32"
            },
            {
              "internalType": "bool",
              "name": "isEnabled",
              "type": "bool"
            },
            {
              "internalType": "uint128",
              "name": "tokenCapacity",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "rate",
              "type": "uint128"
            }
          ],
          "internalType": "struct RateLimiter.TokenBucketConfig[]",
          "name": "configs",
          "type": "tuple[]"
        }
      ],
      "name": "setTokenBucketConfig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  var limiterImplementation = tronWeb.contract(abiLimiterImplementation, LimiterAddress);

  // multiSigWallet contract
  var abiMultiSigWallet = [
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "_members",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "_required",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "Confirmation",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Deposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "Execution",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "returnValue",
          "type": "string"
        }
      ],
      "name": "ExecutionFailure",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "MemberAddition",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "MemberRemoval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "required",
          "type": "uint256"
        }
      ],
      "name": "RequirementChange",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "Revocation",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "Submission",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_member_COUNT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "addMember",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_required",
          "type": "uint256"
        }
      ],
      "name": "changeRequirement",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "confirmTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "confirmations",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "executeTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "getConfirmationCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "getConfirmations",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "_confirmations",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "pending",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "executed",
          "type": "bool"
        }
      ],
      "name": "getTransactionCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getmembers",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "isConfirmed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isMember",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "members",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "removeMember",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "required",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "name": "revokeConfirmation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "destination",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "submitTransaction",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "transactionCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "transactions",
      "outputs": [
        {
          "internalType": "address",
          "name": "destination",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        },
        {
          "internalType": "bool",
          "name": "executed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  var multiSigWallet = tronWeb.contract(abiMultiSigWallet, MultiSigWalletAddress);

  // MerkleTreeImplementation contract
  var abiMerkleTreeImplementation = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "regimentId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "merkleTreeIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lastRecordedLeafIndex",
          "type": "uint256"
        }
      ],
      "name": "MerkleTreeRecorded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "regimentId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        },
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "operator",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "pathLength",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxLeafCount",
              "type": "uint256"
            }
          ],
          "indexed": false,
          "internalType": "struct MerkleTreeImplementation.SpaceInfo",
          "name": "spaceInfo",
          "type": "tuple"
        }
      ],
      "name": "SpaceCreated",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DefaultPathLength",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "PathMaximalLength",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SpaceIdListMaximalLength",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "regimentId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "pathLength",
          "type": "uint256"
        }
      ],
      "name": "createSpace",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        }
      ],
      "name": "getFullTreeCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        }
      ],
      "name": "getLastLeafIndex",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "leaf_index",
          "type": "uint256"
        }
      ],
      "name": "getLeafLocatedMerkleTreeIndex",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "leafNodeIndex",
          "type": "uint256"
        }
      ],
      "name": "getMerklePath",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "treeIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pathLength",
          "type": "uint256"
        },
        {
          "internalType": "bytes32[]",
          "name": "neighbors",
          "type": "bytes32[]"
        },
        {
          "internalType": "bool[]",
          "name": "positions",
          "type": "bool[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "merkle_tree_index",
          "type": "uint256"
        }
      ],
      "name": "getMerkleTreeByIndex",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "spaceId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "merkleTreeIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "firstLeafIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastLeafIndex",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "merkleTreeRoot",
              "type": "bytes32"
            },
            {
              "internalType": "bool",
              "name": "isFullTree",
              "type": "bool"
            }
          ],
          "internalType": "struct MerkleTreeImplementation.MerkleTree",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        }
      ],
      "name": "getMerkleTreeCountBySpace",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "regimentId",
          "type": "bytes32"
        }
      ],
      "name": "getRegimentSpaceIdListMap",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        }
      ],
      "name": "getRemainLeafCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "treeIndex",
          "type": "uint256"
        }
      ],
      "name": "getRemainLeafCountForExactTree",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        }
      ],
      "name": "getSpaceInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "operator",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "pathLength",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxLeafCount",
              "type": "uint256"
            }
          ],
          "internalType": "struct MerkleTreeImplementation.SpaceInfo",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_regimentAddress",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_treeIndex",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "_leafHash",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32[]",
          "name": "_merkelTreePath",
          "type": "bytes32[]"
        },
        {
          "internalType": "bool[]",
          "name": "_isLeftNode",
          "type": "bool[]"
        }
      ],
      "name": "merkleProof",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "spaceId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32[]",
          "name": "leafNodeHash",
          "type": "bytes32[]"
        }
      ],
      "name": "recordMerkleTree",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "regimentAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  var merkleTreeImplementation = tronWeb.contract(abiMerkleTreeImplementation, MerkleTreeAddress);

  // elf contract
  var abiElf = [{
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "owner",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "spender",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "uint256",
      "name": "value",
      "type": "uint256"
    }],
    "name": "Approval",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "from",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "uint256",
      "name": "value",
      "type": "uint256"
    }],
    "name": "Transfer",
    "type": "event"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "owner",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "spender",
      "type": "address"
    }],
    "name": "allowance",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "spender",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }],
    "name": "approve",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "account",
      "type": "address"
    }],
    "name": "balanceOf",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "decimals",
    "outputs": [{
      "internalType": "uint8",
      "name": "",
      "type": "uint8"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "spender",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "subtractedValue",
      "type": "uint256"
    }],
    "name": "decreaseAllowance",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "spender",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "addedValue",
      "type": "uint256"
    }],
    "name": "increaseAllowance",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "account",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "name",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "symbol",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }],
    "name": "transfer",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "from",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }],
    "name": "transferFrom",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  }];
  var elf = tronWeb.contract(abiElf, elfAddress);

  // usdt contract
  var abiUsdt = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "subtractedValue",
          "type": "uint256"
        }
      ],
      "name": "decreaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "addedValue",
          "type": "uint256"
        }
      ],
      "name": "increaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  var usdt = tronWeb.contract(abiUsdt, usdtAddress);


  var _initialMemberList = [
    account1,
    account2,
    account3,
    account4,
    account5];
  var manager = senderAddress;
  try {
    var txn = await limiterImplementation.admin().call();
    console.log("txn:", txn);

    // 1. CreateRegiment
    // var createRegimentTxnId = await regimentImplementation.CreateRegiment(manager, _initialMemberList).send();
    // console.log("createRegimentTxnId:", createRegimentTxnId);
    // await sleep(10000);
    // var createRegimentResult = await tronWeb.trx.getTransactionInfo('68dd6a22e01b61b9c10f8915514fab2eed8f0a0a78a27968f2ae6f92ffdfeb9f');
    // console.log("createRegimentResult:", createRegimentResult);
    // var regimentId = '0x' + createRegimentResult.contractResult;
    // console.log("regimentId:", regimentId);

    // 2. AddAdmins
    // var _newAdmins = [BridgeOutImplementationAddress];
    // var addAdminsTxnId = await regimentImplementation.AddAdmins(regimentId, _newAdmins).send();
    // console.log("addAdminsTxnId:",addAdminsTxnId);
    // await sleep(10000);
    // var addAdminsResult = await tronWeb.trx.getTransactionInfo('11856949415935ee3f28b6c044f30bcb05a27a791a10f35db126fdda726403b8');
    // console.log("addAdminsResult:", addAdminsResult);

    // var regimentInfo = await regimentImplementation.IsRegimentManager('0xb1bff5ac3e79c892215d559d4f17cd143faf98bc659e766653366263b32210e9', '418e760eccfeae90e2c6b6d9f576d87bb8057754dc').call();
    // console.log("regimentInfo:", regimentInfo);

    // 3. SetDefaultTreeDepth
    // var depth = BigInt(3);
    // var setDefaultTreeDepthTxnId = await bridgeOutImplementationV1.setDefaultMerkleTreeDepth(depth).send();
    // console.log("setDefaultTreeDepthTxnId:", setDefaultTreeDepthTxnId);
    // // await sleep(10000);
    // var setDefaultTreeDepthResult = await tronWeb.trx.getTransactionInfo('e122690ba2bdd6cdd7b020a67493b85da64245a2a89eda0b523c536bd640c336');
    // console.log("setDefaultTreeDepthResult:", setDefaultTreeDepthResult);

    // 4. setLimits
    elfTokenMainChainKey = '0x' + generateTokenKey(elfAddress, MainChainId);
    elfTokenSlideChainKey = '0x' + generateTokenKey(elfAddress, SlideChainId);
    usdtTokenMainChainKey = '0x' + generateTokenKey(usdtAddress, MainChainId);
    usdtTokenSlideChainKey = '0x' + generateTokenKey(usdtAddress, SlideChainId);
    var configs = [
      [
        elfTokenMainChainKey,
        true,
        10000000000000000000000n,
        16700000000000000000n
      ],
      [
        elfTokenSlideChainKey,
        true,
        10000000000000000000000n,
        16700000000000000000n
      ],
      [
        usdtTokenMainChainKey,
        true,
        10000000000000000000000n,
        16700000000000000000n
      ],
      [
        usdtTokenSlideChainKey,
        true,
        10000000000000000000000n,
        16700000000000000000n
      ],
    ];
    // var setTokenBucketConfigTxnId = await limiterImplementation.setTokenBucketConfig(configs).send();
    // console.log("setTokenBucketConfigTxnId:", setTokenBucketConfigTxnId);
    // await sleep(10000);
    // var setTokenBucketConfigResult = await tronWeb.trx.getTransaction('f5a86cfb28932da262cbafb48184fb91c1fdc3d2b05cb92a422eeda34d123ea6');
    // console.log("setTokenBucketConfigResult:", setTokenBucketConfigResult);

    var dailyLimit = [
      [
        elfTokenMainChainKey,
        1706151600,
        10000000000000000000000n
      ],
      [
        elfTokenSlideChainKey,
        1706151600,
        10000000000000000000000n
      ],
      [
        usdtTokenMainChainKey,
        1706151600,
        10000000000000000000000n
      ],
      [
        usdtTokenSlideChainKey,
        1706151600,
        10000000000000000000000n
      ],
    ];
    // var setDailyLimitTxnId = await limiterImplementation.setDailyLimit(dailyLimit).send();
    // console.log("setDailyLimitTxnId:", setDailyLimitTxnId);

    // 5. CreateSwap
    // var targetTokenElf = {
    //   token: elfAddress,
    //   fromChainId: chainId,
    //   originShare: 1,
    //   targetShare: 10000000000
    // }
    // var targetTokenMainChainElf = [
      // elfAddress, MainChainId, 1, 10000000000
    // ]
    // var targetTokenSlideChainElf = [
    //   elfAddress, SlideChainId, 1, 10000000000
    // ]
    // var targetTokenMainChainUsdt = [
    //   usdtAddress, MainChainId, 1, 1
    // ]
    // var targetTokenSlideChainUsdt = [
    //   usdtAddress, SlideChainId, 1, 1
    // ]
    // var elfMainChainCreateTokenSwapResult = await bridgeOutImplementationV1.createSwap(targetTokenMainChainElf, '0xb1bff5ac3e79c892215d559d4f17cd143faf98bc659e766653366263b32210e9').send();
    // var elfSlideChainCreateTokenSwapResult = await bridgeOutImplementationV1.createSwap(targetTokenSlideChainElf, regimentId).send();
    // var usdtMainChainCreateTokenSwapResult = await bridgeOutImplementationV1.createSwap(targetTokenMainChainUsdt, regimentId).send();
    // var usdtSlideChainCreateTokenSwapResult = await bridgeOutImplementationV1.createSwap(targetTokenSlideChainUsdt, regimentId).send();
    // console.log("elfMainChainCreateTokenSwapResult:", elfMainChainCreateTokenSwapResult);
    // console.log("elfSlideChainCreateTokenSwapResult:", elfSlideChainCreateTokenSwapResult);
    // console.log("usdtMainChainCreateTokenSwapResult:", usdtMainChainCreateTokenSwapResult);
    // console.log("usdtSlideChainCreateTokenSwapResult:", usdtSlideChainCreateTokenSwapResult);
    // var txn = await tronWeb.trx.getTransactionInfo('872004fa8f22d1e0ce9ea407a9dbe87d0214ac720aa4fe69c42674a24f7efa39');
    // console.log("txn:", txn);

    // Deposit
    // await elf.mint(senderAddress, BigInt(500_000000000000000000)).send();
    // var senderBalance = await elf.balanceOf(senderAddress).call();
    // var balance = await elf.balanceOf(BridgeOutImplementationAddress).call();
    // var allowance = await elf.allowance(senderAddress, BridgeOutImplementationAddress).call();
    // console.log("senderBalance:", senderBalance.toString());
    // console.log("balance:", balance.toString());
    // console.log("allowance:", allowance.toString());
    // var txn2 = await elf.approve(BridgeOutImplementationAddress, BigInt(500_000000000000000000)).send();
    // console.log("txn2:", txn2);
    // console.log("elf token key:", elfTokenMainChainKey);
    var txn3 = await bridgeOutImplementationV1.deposit(elfTokenMainChainKey, elfAddress, BigInt(500_000000000000000000)).send();
    console.log("txn3:", txn3);
    // var depositAmount = await bridgeOutImplementationV1.getDepositAmount(elfTokenMainChainKey).call();
    // console.log("deposit amount:", depositAmount.toString());

    // await elf.mint(senderAddress, BigInt(500_000000000000000000)).send();
    // var senderBalance = await elf.balanceOf(senderAddress).call();
    // var balance = await elf.balanceOf(BridgeOutImplementationAddress).call();
    // var allowance = await elf.allowance(senderAddress, BridgeOutImplementationAddress).call();
    // console.log("senderBalance:", senderBalance.toString());
    // console.log("balance:", balance.toString());
    // console.log("allowance:", allowance.toString());
    // await elf.approve(BridgeOutImplementationAddress, BigInt(500_000000000000000000)).send();
    // console.log("elf token key:", elfTokenSlideChainKey);
    // await bridgeOutImplementationV1.deposit(elfTokenSlideChainKey, elfAddress, BigInt(500_000000000000000000)).send();
    // var depositAmount = await bridgeOutImplementationV1.getDepositAmount(elfTokenSlideChainKey).call();
    // console.log("deposit amount:", depositAmount.toString());

    // await elf.mint(senderAddress, BigInt(500_000000000000000000)).send();
    // var senderBalance = await elf.balanceOf(senderAddress).call();
    // var balance = await elf.balanceOf(BridgeOutImplementationAddress).call();
    // var allowance = await elf.allowance(senderAddress, BridgeOutImplementationAddress).call();
    // console.log("senderBalance:", senderBalance.toString());
    // console.log("balance:", balance.toString());
    // console.log("allowance:", allowance.toString());
    // await elf.approve(BridgeOutImplementationAddress, BigInt(500_000000000000000000)).send();
    // console.log("usdt token key:", usdtTokenMainChainKey);
    // await bridgeOutImplementationV1.deposit(usdtTokenMainChainKey, usdtAddress, BigInt(500_000000000000000000)).send();
    // var depositAmount = await bridgeOutImplementationV1.getDepositAmount(usdtTokenMainChainKey).call();
    // console.log("deposit amount:", depositAmount.toString());

    // await elf.mint(senderAddress, BigInt(500_000000000000000000)).send();
    // var senderBalance = await elf.balanceOf(senderAddress).call();
    // var balance = await elf.balanceOf(BridgeOutImplementationAddress).call();
    // var allowance = await elf.allowance(senderAddress, BridgeOutImplementationAddress).call();
    // console.log("senderBalance:", senderBalance.toString());
    // console.log("balance:", balance.toString());
    // console.log("allowance:", allowance.toString());
    // await elf.approve(BridgeOutImplementationAddress, BigInt(500_000000000000000000)).send();
    // console.log("usdt token key:", usdtTokenSlideChainKey);
    // await bridgeOutImplementationV1.deposit(usdtTokenSlideChainKey, usdtAddress, BigInt(500_000000000000000000)).send();
    // var depositAmount = await bridgeOutImplementationV1.getDepositAmount(usdtTokenSlideChainKey).call();
    // console.log("deposit amount:", depositAmount.toString());

    // // SetBridgeOut
    // var setBridgeOutResult = await bridgeInImplementation.setBridgeOut(BridgeOutImplementationAddress).send();
    // console.log(setBridgeOutResult);

    // // AddToken
    var chainIdMain = "MainChain_AELF";
    var chainIdSide = "SideChain_tDVV";
    // // var tokens = [{
    // //     tokenAddress:elfAddress,
    // //     chainId:chainIdMain
    // // },{
    // //     tokenAddress:usdtAddress,
    // //     chainId:chainIdMain
    // // },{
    // //     tokenAddress:elfAddress,
    // //     chainId:chainIdSide
    // // },{
    // //     tokenAddress:usdtAddress,
    // //     chainId:chainIdSide
    // // }]
    // var tokens = [
    //   [elfAddress, chainIdMain],
    //   [usdtAddress, chainIdMain],
    //   [elfAddress, chainIdSide],
    //   [usdtAddress, chainIdSide]
    // ];
    // var addTokenResult = await bridgeInImplementation.addToken(tokens).send();
    // console.log(addTokenResult);

  } catch (error) {
    console.error('An error occurred:', error);
  }

  function createMessage(nodeNumber, leafHash) {
    var message = ethers.utils.solidityPack(["uint256", "bytes32"], [nodeNumber, leafHash])
    return { message };
  }
  function _generateTokenKey(token, chainId) {
    var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
    return ethers.utils.sha256(data);
  }
  function generateTokenKey(token, chainId) {
    const data = tronWeb.sha3(token + chainId);
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash;
  }
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  // function generateTokenKey(token, chainId) {
  //   return sha256(abi.encodePacked(token, chainId));
  // }
}

initialize();