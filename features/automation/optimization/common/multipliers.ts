import BigNumber from 'bignumber.js'
import { MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'features/automation/common/consts'
import { calculateMultipleFromTargetCollRatio } from 'features/automation/common/helpers/calculateMultipleFromTargetCollRatio'

interface GetConstantMultipleMultipliersProps {
  ilk: string
  minColRatio: BigNumber
  maxColRatio: BigNumber
}

interface GetDefaultMultiplierProps {
  multipliers: number[]
  minColRatio: BigNumber
  maxColRatio: BigNumber
}

const AMOUNT_OF_MULTIPLIERS_TO_GENERATE = 5

const multipliersPresets = {
  '1.3-2': [1.3, 1.5, 1.75, 2],
  '1.3-2.25': [1.3, 1.5, 1.75, 2, 2.25],
  '1.5-2.75': [1.5, 2, 2.25, 2.5, 2.75],
  '1.5-3.5': [1.5, 2, 2.5, 3, 3.5],
}

const ilksMultipliers: { [key: string]: number[] } = {
  'ETH-A': multipliersPresets['1.5-2.75'],
  'ETH-B': multipliersPresets['1.5-3.5'],
  'ETH-C': multipliersPresets['1.3-2.25'],
  'LINK-A': multipliersPresets['1.3-2.25'],
  'RENBTC-A': multipliersPresets['1.3-2.25'],
  'WBTC-A': multipliersPresets['1.3-2.25'],
  'WBTC-B': multipliersPresets['1.5-3.5'],
  'WBTC-C': multipliersPresets['1.3-2.25'],
  'WSTETH-A': multipliersPresets['1.3-2.25'],
  'WSTETH-B': multipliersPresets['1.3-2'],
  'YFI-A': multipliersPresets['1.3-2.25'],
}

function generateMultipliers({
  minColRatio,
  maxColRatio,
}: Omit<GetConstantMultipleMultipliersProps, 'ilk'>): number[] {
  const colRatioOffset = maxColRatio
    .minus(minColRatio)
    .div(new BigNumber(AMOUNT_OF_MULTIPLIERS_TO_GENERATE - 1))

  const allowedColRatios = [
    minColRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
    ...[...Array(AMOUNT_OF_MULTIPLIERS_TO_GENERATE - 2)].map((_, i) => {
      return minColRatio.plus(colRatioOffset.times(i + 1))
    }),
    maxColRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
  ]

  return allowedColRatios.reverse().map((item, i) => {
    const multiplier = calculateMultipleFromTargetCollRatio(item).toNumber()

    if (i === 0) return Math.ceil(multiplier * 20) / 20
    else if (i + 1 === allowedColRatios.length) return Math.floor(multiplier * 20) / 20
    else return Math.round(multiplier * 20) / 20
  })
}

export function getConstantMultipleMultipliers({
  ilk,
  minColRatio,
  maxColRatio,
}: GetConstantMultipleMultipliersProps): number[] {
  return Object.keys(ilksMultipliers).includes(ilk)
    ? ilksMultipliers[ilk]
    : generateMultipliers({ minColRatio, maxColRatio })
}

export function getDefaultMultiplier({
  multipliers,
  minColRatio,
  maxColRatio,
}: GetDefaultMultiplierProps): number | undefined {
  const midIndex = Math.ceil(multipliers.length / 2) - 1
  const minMultiplier = calculateMultipleFromTargetCollRatio(
    maxColRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
  ).toNumber()
  const maxMultiplier = calculateMultipleFromTargetCollRatio(
    minColRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
  ).toNumber()

  if (multipliers[midIndex] >= minMultiplier && multipliers[midIndex] <= maxMultiplier)
    return multipliers[midIndex]
  else {
    for (let i = midIndex; i >= 0; i--) {
      if (multipliers[i] >= minMultiplier && multipliers[i] <= maxMultiplier) return multipliers[i]
    }
    for (let i = midIndex; i < multipliers.length; i++) {
      if (multipliers[i] >= minMultiplier && multipliers[i] <= maxMultiplier) return multipliers[i]
    }
    return multipliers[midIndex]
  }
}
