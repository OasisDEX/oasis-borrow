import { expect } from 'chai'

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
    expect(tokens).to.be.an('array')
    tokens.forEach((tokenData) => {
      expect(tokenData).to.include.keys(tokenKeys)
    })
  })
  it('should return token metadata', () => {
    expect(getToken('ETH')).to.include.keys(tokenKeys)
  })
  it('should return metadata for multiple tokens', () => {
    getTokens(tokens.map((token) => token.symbol)).forEach((tokenData) => {
      expect(tokenData).to.include.keys(tokenKeys)
    })
  })
})
