import { getToken } from 'blockchain/tokensMetadata'
import { depositTokensConfigList } from 'features/aave/strategies/deposit-tokens-config-list'

describe('Deposit tokens list', () => {
  depositTokensConfigList.forEach((depositTokensConfig) => {
    it(`All tokens should be configured for ${depositTokensConfig.networkId}/${depositTokensConfig.protocol} in the tokenConfigs`, () => {
      const notFoundList = [] as string[]
      depositTokensConfig.list.forEach((token) => {
        try {
          getToken(token)
        } catch (error) {
          notFoundList.push(token)
        }
      })
      expect(notFoundList).toEqual([])
    })
  })
})
