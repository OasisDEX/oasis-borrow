import type {
  HighestMultiplyPnl,
  HighestRiskPositions,
  LargestDebt,
  MostYieldEarned,
} from '@prisma/client'
import { Prisma } from '@prisma/client'
import type {
  DiscoverTableColRatioRowData,
  DiscoverTableStatusRowDataApi,
} from 'features/discover/types'
import { DiscoverTableVaultStatus } from 'features/discover/types'

type OmitNonDecimal<T> = { [K in keyof T]: T[K] extends Prisma.Decimal ? K : never }[keyof T]
type DiscoverLite = OmitNonDecimal<HighestMultiplyPnl | MostYieldEarned>

const ELIGIBLE_TIME_SIGNATURES = ['1d', '7d', '30d', '365d']

export function wrapFilterCombination(
  field: string,
  fn: (filter?: string) => Prisma.StringFilter,
  filter?: string,
): { [k: string]: Prisma.StringFilter }[] {
  return filter ? filter.split(',').map((item) => ({ [field]: fn(item) })) : []
}

export function getGenericRangeFilter(filter?: string): Prisma.StringFilter {
  const split = filter?.split('-')

  if (filter?.length && split) {
    if (split.length > 1) return { gte: split[0], lte: split[1] }
    else if (split[0].startsWith('>')) return { gt: split[0].substring(1) }
    else if (split[0].startsWith('<')) return { lt: split[0].substring(1) }
    else return { equals: split[0] }
  } else return { gt: '0' }
}

export function getGenericArrayFilter(filter?: string): Prisma.StringFilter {
  return {
    in: filter?.split(','),
  }
}

export function getTimeSignature(prefix: string, time?: string): DiscoverLite {
  if (time && ELIGIBLE_TIME_SIGNATURES.includes(time)) return `${prefix}_${time}` as DiscoverLite
  else return `${prefix}_all` as DiscoverLite
}

export function getColRatio(item: LargestDebt): DiscoverTableColRatioRowData {
  return {
    level: item.coll_ratio.times(100).toNumber(),
    isAtRiskDanger: item.liquidation_proximity.times(100).lte(10),
    isAtRiskWarning:
      item.liquidation_proximity.times(100).lte(25) && item.liquidation_proximity.times(100).gt(10),
  }
}

export function getStatus(item: HighestRiskPositions) {
  const status = item.status as DiscoverTableStatusRowDataApi

  if (!status) {
    return
  }
  switch (status.kind) {
    case DiscoverTableVaultStatus.LIQUIDATED:
    case DiscoverTableVaultStatus.BEING_LIQUIDATED:
      return status
    case DiscoverTableVaultStatus.TO_STOP_LOSS:
      return {
        ...status,
        additionalData: {
          toStopLoss: item.collateral_ratio
            .mul(100)
            .minus(new Prisma.Decimal(status.additionalData!.stopLossLevel!))
            .mul(100)
            .div(item.collateral_ratio)
            .floor()
            .div(100),
        },
      }
    default:
      return {
        ...status,
        additionalData: {
          tillLiquidation: item.liquidation_proximity.mul(10000).floor().div(100),
        },
      }
  }
}
