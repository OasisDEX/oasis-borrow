import { ajnaBuckets } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'

export const mappedAjnaBuckets = ajnaBuckets.map((price) =>
  new BigNumber(price).shiftedBy(NEGATIVE_WAD_PRECISION),
)

export const mappedRawAjnaBuckets = ajnaBuckets.map((v) => new BigNumber(v))

export const snapToPredefinedValues = (value: BigNumber) => {
  return mappedAjnaBuckets.reduce((prev, curr) => {
    return curr.minus(value).abs().lt(prev.minus(value).abs()) ? curr : prev
  })
}
