import { expect } from 'chai'
import { MainNetworkNames } from 'helpers/networkNames'

import { getToken, getTokens, getTokensWithChain, tokens } from './tokensMetadata'

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
  'chain',
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
  it('should return metadata for multiple tokens, filtering the chain', () => {
    getTokensWithChain(
      tokens.map((token) => token.symbol),
      MainNetworkNames.ethereumMainnet,
    ).forEach((tokenData) => {
      expect(tokenData).to.include.keys(tokenKeys)
    })
  })
})
