import { BigNumber } from 'bignumber.js'

import { roundToThousand } from './roundToThousand'

const notRoundedValue = new BigNumber(12345)

describe('roundToThousand', () => {
  it('should return value rounded to thousand floor', () => {
    const roundedValue = roundToThousand(notRoundedValue)

    expect(roundedValue).toEqual(new BigNumber(12000))
  })

  it('should return value rounded to thousand ceil', () => {
    const roundedValue = roundToThousand(notRoundedValue, 2)

    expect(roundedValue).toEqual(new BigNumber(13000))
  })
})
