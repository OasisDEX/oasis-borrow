import { getToken, getTokens } from './tokensMetadata'
import { tokens } from './tokensMetadata.constants'

const tokenKeys = ['symbol', 'precision', 'digits', 'name', 'icon', 'iconCircle', 'tags']

describe('tokens metadata', () => {
  it('hardcoded tokens should have proper keys', () => {
    expect(Array.isArray(tokens)).toBe(true)
    tokens.forEach((tokenData) => {
      const keys = Object.keys(tokenData)
      expect(keys).toEqual(expect.arrayContaining(tokenKeys))
    })
  })
  it('should return token metadata', () => {
    const tokenData = getToken('ETH')
    const keys = Object.keys(tokenData)
    expect(keys).toEqual(expect.arrayContaining(tokenKeys))
  })
  it('should return metadata for multiple tokens', () => {
    getTokens(tokens.map((token) => token.symbol)).forEach((tokenData) => {
      const keys = Object.keys(tokenData)
      expect(keys).toEqual(expect.arrayContaining(tokenKeys))
    })
  })
})
