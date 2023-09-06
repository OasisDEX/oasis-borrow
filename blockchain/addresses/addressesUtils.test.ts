import { ADDRESSES } from '@oasisdex/addresses'
import { getCollaterals, getCollateralTokens } from 'blockchain/addresses/addressesUtils'
import { supportedIlks } from 'blockchain/tokens/mainnet'

const { mainnet } = ADDRESSES

describe('adressesUtils', () => {
  it('should filter collaterals correctly', async () => {
    const actual = getCollaterals({ PIP_ETH: '', PIP_XYZ: '', XYZ_WBTC: '' }, supportedIlks)

    expect(actual).toBeDefined()
    expect(actual.length).toBe(1)
    expect(actual[0]).toBe('ETH')
  })
  it('should filter collateral tokens correctly', async () => {
    const collaterals = getCollaterals(mainnet.common, supportedIlks)
    const tokens = getCollateralTokens(mainnet.common, supportedIlks)

    expect(Object.keys(tokens).length).toBe(collaterals.length)
    Object.keys(tokens).forEach((element, idx) => {
      expect(element).toBe(collaterals[idx])
    })
  })
})
