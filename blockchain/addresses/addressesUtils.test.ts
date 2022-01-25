import { getCollaterals, getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import mainnet from 'blockchain/addresses/mainnet.json'
import { supportedIlks } from 'blockchain/config'
import { expect } from 'chai'

describe('adressesUtils', () => {
  it('should filter collaterals correctly', async function () {
    const actual = getCollaterals({ PIP_ETH: '', PIP_XYZ: '', XYZ_WBTC: '' }, supportedIlks)
    expect(actual).to.be.not.undefined
    expect(actual.length).to.be.equal(1)
    expect(actual[0]).to.be.equal('ETH')
  })
  it('should filter collateral tokens correctly', async function () {
    const collaterals = getCollaterals(mainnet, supportedIlks)
    const tokens = getCollateralTokens(mainnet, supportedIlks)
    expect(Object.keys(tokens).length).to.be.equal(collaterals.length)
    Object.keys(tokens).forEach((element, idx) => {
      expect(element).to.be.equal(collaterals[idx])
    })
  })
})
