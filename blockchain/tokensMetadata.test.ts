import { getToken, getTokens, tokens } from './tokensMetadata'

const tokenKeys = [
  'symbol',
  'precision',
  'digits',
  'name',
  'icon',
  'iconCircle',
  'iconColor',
  'color',
  'background',
  'bannerIcon',
  'bannerGif',
  'tags',
]

describe('tokens metadata', () => {
  it('hardcoded tokens should have proper keys', () => {
    expect(Array.isArray(tokens)).toBe(true)
    tokens.forEach((tokenData) => {
      expect(Object.keys(tokenData)).toContain(tokenKeys)
    })
  })
  it('should return token metadata', () => {
    expect(Object.keys(getToken('ETH'))).toContain(tokenKeys)
  })
  it('should return metadata for multiple tokens', () => {
    getTokens(tokens.map((token) => token.symbol)).forEach((tokenData) => {
      expect(Object.keys(tokenData)).toContain(tokenKeys)
    })
  })
})
