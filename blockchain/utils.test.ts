import BigNumber from 'bignumber.js'
import { amountFromGwei, amountFromRad, amountFromRay } from 'blockchain/utils'
import { RAD } from 'components/constants'
import { one } from 'helpers/zero'

describe('utils$', () => {
  it('should not reconfigure global precision for bignumber', () => {
    const defaultDecimals = BigNumber.config({}).DECIMAL_PLACES

    amountFromRad(one)
    expect(BigNumber.config({}).DECIMAL_PLACES).toBe(defaultDecimals)

    amountFromRay(one)
    expect(BigNumber.config({}).DECIMAL_PLACES).toBe(defaultDecimals)
  })

  it('should not lose precision when dividing rad value', () => {
    const radValue = RAD.plus(2)

    const radValueUnits = amountFromRad(radValue)
    const halfRadValueUnits = radValueUnits.div(2)

    // Return values is not needed, so ignore it
    amountFromRay(one)

    expect(halfRadValueUnits.toFixed()).toBe('0.500000000000000000000000000000000000000000001')
    expect(radValueUnits.div(2).toFixed()).toBe(halfRadValueUnits.toFixed())
  })

  // TODO: [Mocha -> Jest] Rewrite in Jest compatible format.
  it.skip('should convert from gwei correctly', () => {
    expect(amountFromGwei(new BigNumber('1')).toString()).toBe('0.000000001')
  })
})
