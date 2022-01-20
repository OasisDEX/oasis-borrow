import { getCollaterals, getCollateralTokens, getOsms } from 'blockchain/addresses/addressesUtils'
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
  it('should form correct OSM', async function () {
    const uniqueAssets = supportedIlks
      .map((x) => x.substring(0, x.indexOf('-') > 0 ? x.indexOf('-') : x.length))
      .filter((v, i, a) => a.indexOf(v) === i /* distinct equivalent */)

    const osms = getOsms(mainnet, supportedIlks)
    expect(Object.keys(osms).length).to.be.equal(uniqueAssets.length)
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
