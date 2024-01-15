const port = process.env.HOST_PORT || 9090

module.exports = {
  networks: {
    mainnet: {
      // Don't put your private key here:
      privateKey: process.env.PRIVATE_KEY_MAINNET,
      /*
      Create a .env file (it must be gitignored) containing something like

      export PRIVATE_KEY_MAINNET=4E7FEC...656243

      Then, run the migration with:

      source .env && tronbox migrate --network mainnet
      */
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    },
    shasta: {
      privateKey: 'db42c4a83fc5b525ec5b10dadb23abca88a3a333e3f0f4b6c5ed099a96cd2ce8',
      userFeePercentage: 50,
      feeLimit: 1e9,
      originEnergyLimit: 10000000,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
    nile: {
      privateKey: '34645bd0767d908b08629092335b4612ecd25bd69a401fbac00d8765596d513c',
      userFeePercentage: 100,
      feeLimit: 1e9,
      originEnergyLimit: 1e7,
      fullHost: 'https://nile.trongrid.io',
      network_id: '3'
    },
    development: {
      // For tronbox/tre docker image
      privateKey: '0000000000000000000000000000000000000000000000000000000000000001',
      userFeePercentage: 0,
      // feeLimit: 1000 * 1e6,
      fullHost: 'http://127.0.0.1:' + port,
      network_id: '9'
    },
    test: {
      // For tronbox/tre docker image
      privateKey: '0000000000000000000000000000000000000000000000000000000000000001',
      userFeePercentage: 0,
      // feeLimit: 1000 * 1e6,
      fullHost: 'http://192.168.67.173:' + port,
      network_id: '9'
    },
    compilers: {
      solc: {
        version: '0.8.11'
      },
    }
  },
  // solc compiler optimize
  solc: {
  //   optimizer: {
  //     enabled: true,
  //     runs: 200
  //   },
  //   evmVersion: 'istanbul'
  }
}
