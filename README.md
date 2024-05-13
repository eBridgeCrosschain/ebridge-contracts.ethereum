# ebridge-contracts.ethereum

BRANCH | AZURE PIPELINES                                                                                                                                                                                              | TESTS                                                                                                                                                                            | CODE COVERAGE
-------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------
MASTER   | [![Build Status](https://dev.azure.com/eBridgeCrosschain/ebridge-contracts.ethereum/_apis/build/status%2FeBridgeCrosschain.ebridge-contracts.ethereum?branchName=master)](https://dev.azure.com/eBridgeCrosschain/ebridge-contracts.ethereum/_build/latest?definitionId=11&branchName=master) | [![Test Status](https://img.shields.io/azure-devops/tests/eBridgeCrosschain/ebridge-contracts.ethereum/11/master)](https://dev.azure.com/eBridgeCrosschain/ebridge-contracts.ethereum/_build/latest?definitionId=11&branchName=master) | [![codecov](https://codecov.io/gh/eBridgeCrosschain/ebridge-contracts.ethereum/branch/master/graph/badge.svg?token=N0ADSUJ1LT)](https://codecov.io/gh/eBridgeCrosschain/ebridge-contracts.ethereum)
DEV    | [![Build Status](https://dev.azure.com/eBridgeCrosschain/ebridge-contracts.ethereum/_apis/build/status%2FeBridgeCrosschain.ebridge-contracts.ethereum?branchName=dev)](https://dev.azure.com/eBridgeCrosschain/ebridge-contracts.ethereum/_build/latest?definitionId=11&branchName=dev)   | [![Test Status](https://img.shields.io/azure-devops/tests/eBridgeCrosschain/ebridge-contracts.ethereum/11/dev)](https://dev.azure.com/eBridgeCrosschain/ebridge-contracts.ethereum/_build/latest?definitionId=11&branchName=dev)   | [![codecov](https://codecov.io/gh/eBridgeCrosschain/ebridge-contracts.ethereum/branch/dev/graph/badge.svg?token=N0ADSUJ1LT)](https://codecov.io/gh/eBridgeCrosschain/ebridge-contracts.ethereum)


## Unit tests

For running unit tests, refer to the following commands.


To run all unit tests
```
npx hardhat test
```

To run the specific unit test
```
npx hardhat test test/BridgeIn.test.js
```
