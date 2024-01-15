import { getToken } from 'blockchain/tokensMetadata'
import {
  depositTokensList,
  depositTokensListKeys,
} from 'features/aave/strategies/deposit-tokens-list'

describe('Deposit tokens list', () => {
  depositTokensListKeys.forEach((networkId) => {
    it(`All tokens should be configured for ${networkId} in the tokenConfigs`, () => {
      const notFoundList = [] as string[]
      depositTokensList[networkId].list.forEach((token) => {
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
