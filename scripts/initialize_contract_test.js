async function initialize() {

  const Web3 = require('web3');
  const crypto = require('crypto');
  const ethers = require('ethers');
  const TronWeb = require('tronweb');
  var privateKey = crypto.randomBytes(32).toString('hex');
  console.log("Private Key", privateKey);

  const authorAccountAddress = "TNxUP6jngXG5XqpKAFBWsu3TDNv6nWJL7m";
  const authorAccountPrivateKey = "0000000000000000000000000000000000000000000000000000000000000001";

  const tronWeb = new TronWeb({
    fullHost: 'https://nile.trongrid.io',
    headers: { "TRON-PRO-API-KEY": 'bb9a7a1e-9bb5-4807-a4ba-6d0813a9b7f7' },
    privateKey: authorAccountPrivateKey
  })

  const senderAddress = authorAccountAddress;
  const account1 = authorAccountAddress;
  const account2 = authorAccountAddress;
  const account3 = authorAccountAddress;
  const account4 = authorAccountAddress;
  const account5 = authorAccountAddress;

  const usdtAddress = "4117d47dfe41b646025398a53496d2ae7618078f8b";
  const wtrxAddress = "41bd483e11ad5bbc75c516973fa5135c51a97cbfc2";

  const RegimentAddress = '41fa50b7247fee7ec5eba04625aaa7c6e80596fcd9';
  const BridgeInAddress = '410afd18b74df05706a633f666e6d1642f7146cf68';
  const BridgeOutAddress = '419cdd564c6a1810071cd9aa599c4abda0d2eee5ac';
  const LimiterAddress = '412e13fedfda8bf0d30ebf1ae4114d176d24514a97';
  const MultiSigWalletAddress = '41b6018975cde0d846573a5e87715d66d2cc174472';
  const MerkleTreeAddress = '4178a8a9cf1fb6749cc06e0f94d213b5388792fd9a';

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
    // abi: abibridgeOutImplementationV1,
    // bytecode: code,
    // feeLimit: 1e10,  // Set fee limit
  // });

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

  var abiWtrx = [
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
          "name": "value",
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
          "name": "recipient",
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
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
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
  var wtrx = tronWeb.contract(abiWtrx, wtrxAddress);

  var _initialMemberList = [
    account1,
    account2,
    account3,
    account4,
    account5];
  var manager = senderAddress;
  try {
    // test();
    // createRegiment();
    var regimentId = "0x" + "42e53daf1dc0fa6a3199138e507e8887db7d76af2697f19ad9a68ccf7ae462da";
    // getTransactionResult("6582c263d8bac4144f4127ee9bb8312c124ecc5bcbe0febc494cd9e3a6f833f1");
    // getErrorMessage("08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000022546f6b656e206973206e6f7420737570706f727420696e207468617420636861696e000000000000000000000000000000000000000000000000000000000000");

    // addAdmins();

    // setDefaultMerkleTreeDepth();

    usdtTokenMainChainKey = _generateTokenKey('0x' + usdtAddress.substring(2), MainChainId);
    usdtTokenSlideChainKey = _generateTokenKey('0x' + usdtAddress.substring(2), SlideChainId);
    wtrxTokenMainChainKey = _generateTokenKey('0x' + wtrxAddress.substring(2), MainChainId);
    wtrxTokenSlideChainKey = _generateTokenKey('0x' + wtrxAddress.substring(2), SlideChainId);

    // setTokenBucketConfig();
    // setDailyLimit();
    
    // createSwap();

    // deposit(usdtTokenMainChainKey);
    getDepositAmount('0x' + usdtAddress.substring(2), MainChainId)
    // deposit(usdtTokenSlideChainKey);
    // deposit(usdtTokenSlideChainKey);

    // setBridgeOut();

    // setLimiter();

    // addToken();

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

  async function createRegiment() {
    var createRegimentTxnId = await regimentImplementation.CreateRegiment(manager, _initialMemberList).send();
    console.log("createRegimentTxnId:", createRegimentTxnId);
  }
  async function addAdmins() {
    var _newAdmins = [BridgeOutAddress];
    var addAdminsTxnId = await regimentImplementation.AddAdmins(regimentId, _newAdmins).send();
    console.log("addAdminsTxnId:", addAdminsTxnId);
  }
  async function setDefaultMerkleTreeDepth() {
    var depth = BigInt(3);
    var setDefaultTreeDepthTxnId = await bridgeOutImplementationV1.setDefaultMerkleTreeDepth(depth).send();
    console.log("setDefaultTreeDepthTxnId:", setDefaultTreeDepthTxnId);
  }
  async function setTokenBucketConfig() {
    var configs = [
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
    var setTokenBucketConfigTxnId = await limiterImplementation.setTokenBucketConfig(configs).send();
    console.log("setTokenBucketConfigTxnId:", setTokenBucketConfigTxnId);
  }
  async function setDailyLimit() {
    var dailyLimit = [
      [
        usdtTokenMainChainKey,
        1706572800,
        10000000000000000000000n
      ],
      [
        usdtTokenSlideChainKey,
        1706572800,
        10000000000000000000000n
      ],
    ];
    var setDailyLimitTxnId = await limiterImplementation.setDailyLimit(dailyLimit).send();
    console.log("setDailyLimitTxnId:", setDailyLimitTxnId);
  }
  async function createSwap() {
    var targetTokenMainChainUsdt = [
      usdtAddress, MainChainId, 1, 1
    ]
    var targetTokenSlideChainUsdt = [
      usdtAddress, SlideChainId, 1, 1
    ]
    var usdtMainChainCreateTokenSwapTxnId = await bridgeOutImplementationV1.createSwap(targetTokenMainChainUsdt, regimentId).send(
      {
        feeLimit:1e10
      });
    var usdtSlideChainCreateTokenSwapTxnId = await bridgeOutImplementationV1.createSwap(targetTokenSlideChainUsdt, regimentId).send({
        feeLimit:1e10
      });
    console.log("usdtMainChainCreateTokenSwapTxnId:", usdtMainChainCreateTokenSwapTxnId);
    console.log("usdtSlideChainCreateTokenSwapTxnId:", usdtSlideChainCreateTokenSwapTxnId);
  }
  async function deposit(tokenKey) {
    var mintTxnId = await usdt.mint(senderAddress, BigInt(500_000000000000000000)).send();
    console.log("mintTxnId:", mintTxnId);
    var senderBalance = await usdt.balanceOf(senderAddress).call();
    var contractBalance = await usdt.balanceOf(BridgeInAddress).call();
    var contractAllowance = await usdt.allowance(senderAddress, BridgeInAddress).call();
    console.log("senderBalance:", senderBalance.toString());
    console.log("contractBalance:", contractBalance.toString());
    console.log("contractAllowance:", contractAllowance.toString());
    var approveTxnId = await usdt.approve(BridgeInAddress, BigInt(500_000000000000000000)).send();
    console.log("approveTxnId:", approveTxnId);
  }
  async function getDepositAmount(tokenAddress, chainId) {
    tokenKey = _generateTokenKey(tokenAddress, chainId);
    console.log("tokenKey:", tokenKey);
    var swapId = await bridgeOutImplementationV1.getSwapId(tokenAddress, chainId).call();
    console.log("swapId:", swapId);
    var depositTxnId = await bridgeInImplementation.deposit(tokenKey, usdtAddress, BigInt(500_000000000000000000)).send();
    console.log("depositTxnId:", depositTxnId);
    var depositAmount = await bridgeOutImplementationV1.getDepositAmount(swapId).call();
    console.log("depositAmount:", depositAmount.toString());
  }
  async function setBridgeOut() {
    var setBridgeOutTxnId = await bridgeInImplementation.setBridgeOut(BridgeOutAddress).send();
    console.log("setBridgeOutTxnId:", setBridgeOutTxnId);
  }
  async function addToken() {
    var chainIdMain = "MainChain_AELF";
    var chainIdSide = "SideChain_tDVV";
    var tokens = [{
        tokenAddress:usdtAddress,
        chainId:chainIdMain
    },{
        tokenAddress:usdtAddress,
        chainId:chainIdSide
    }]
    var tokens = [
      [usdtAddress, chainIdMain],
      [usdtAddress, chainIdSide]
    ];
    var addTokenTxnId = await bridgeInImplementation.addToken(tokens).send();
    console.log("addTokenTxnId:", addTokenTxnId);
  }
  async function setLimiter() {
    var setInLimiterTxnId = await bridgeInImplementation.setLimiter(LimiterAddress).send();
    var setOutLimiterTxnId = await bridgeOutImplementationV1.setLimiter(LimiterAddress).send();
    console.log("setInLimiterTxnId:", setInLimiterTxnId);
    console.log("setOutLimiterTxnId:", setOutLimiterTxnId);
  }
  async function getTransactionResult(transactionId) {
    var transactionResult = await tronWeb.trx.getTransactionInfo(transactionId);
    console.log("transactionResult:", transactionResult);
  }
  async function getErrorMessage(errorMessage) {
    console.log("Error:", Buffer.from(errorMessage, 'hex').toString());
  }
  async function test() {
    var params = {
      "token":"TCbNFfGoWxBH1KFDfjR5hQNyyLDCsyWHzV",
      "amount":"TCbNFfGoWxBH1KFDfjR5hQNyyLDCsyWHzV",
      "targetChainId":"TCbNFfGoWxBH1KFDfjR5hQNyyLDCsyWHzV",
      "targetAddress":"TCbNFfGoWxBH1KFDfjR5hQNyyLDCsyWHzV"
    }
    var txn = await bridgeInImplementation.createReceipt("TC9D6ghWXUcGPdhvJZPMVvmST5WkX6Rock", BigInt(12000000), "MainChain_AELF", "iupiTuL2cshxB9UNauXNXe9iyCcqka7jCotodcEHGpNXeLzqG").send(
      {
        feeLimit:1e10
      });
    console.log("txn:", txn);
  }
}

initialize();