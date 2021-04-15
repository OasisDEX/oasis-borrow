/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: '0.7.3',
  networks: {
    hardhat: {
      chainId: 2137,
      forking: {
        url: 'https://eth-mainnet.alchemyapi.io/v2/IHJOWZSabgMvTt3kjXnZ0Urzo8FFweES',
        blockNumber: 12192700,
      },
      mining: {
        auto: true,
        interval: 1000,
      },
    },
  },
}
