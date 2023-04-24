import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { RAD } from 'components/constants'
import { one } from 'helpers/zero'

import { amountFromGwei, amountFromRad, amountFromRay } from './utils'

describe('utils$', () => {
  it('should not reconfigure global precision for bignumber', () => {
    const defaultDecimals = BigNumber.config({}).DECIMAL_PLACES

    amountFromRad(one)
    expect(BigNumber.config({}).DECIMAL_PLACES).to.eq(defaultDecimals)

    amountFromRay(one)
    expect(BigNumber.config({}).DECIMAL_PLACES).to.eq(defaultDecimals)
  })

  it('should not lose precision when dividing rad value', () => {
    const radValue = RAD.plus(2)

    const radValueUnits = amountFromRad(radValue)
    const halfRadValueUnits = radValueUnits.div(2)

    // Return values is not needed, so ignore it
    amountFromRay(one)

    expect(halfRadValueUnits.toFixed()).to.eq('0.500000000000000000000000000000000000000000001')
    expect(radValueUnits.div(2).toFixed()).to.eq(halfRadValueUnits.toFixed())
  })

  // TODO: [Migrating to JEST] - Remove skip
  it.skip('should convert from gwei correctly', () => {
    expect(amountFromGwei(new BigNumber('1')).toString()).to.eq('0.000000001')
  })
})
