import {
  HighestMultiplyPnl,
  HighestRiskPositions,
  LargestDebt,
  MostYieldEarned,
  Prisma,
} from '@prisma/client'
import {
  DiscoverTableColRatioRowData,
  DiscoverTableStatusRowDataApi,
  DiscoverTableVaultStatus,
} from 'features/discover/types'

type OmitNonDecimal<T> = { [K in keyof T]: T[K] extends Prisma.Decimal ? K : never }[keyof T]
type DiscoverLite = OmitNonDecimal<HighestMultiplyPnl | MostYieldEarned>

const ELIGIBLE_TIME_SIGNATURES = ['1d', '7d', '30d', '365d']

export function getGenericRangeFilter(filter?: string): Prisma.StringFilter {
  const split = filter?.split('-')

  if (split) {
    if (split.length > 1) return { gte: split[0], lte: split[1] }
    else if (split[0].startsWith('>')) return { gt: split[0].substring(1) }
    else if (split[0].startsWith('<')) return { lt: split[0].substring(1) }
    else return { equals: split[0] }
  } else return { gte: '0' }
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
    level: item.coll_ratio.toNumber(),
    isAtRiskDanger: item.liquidation_proximity.lte(10),
    isAtRiskWarning: item.liquidation_proximity.lte(25) && item.liquidation_proximity.gt(10),
  }
}

export function getStatus(item: HighestRiskPositions) {
  const status = item.status as DiscoverTableStatusRowDataApi
  if (!status) {
    return
  }
  switch (status.kind) {
    case DiscoverTableVaultStatus.TO_STOP_LOSS:
      return {
        ...status,
        additionalData: {
          toStopLoss: item.collateral_ratio
            .mul(100)
            .minus(new Prisma.Decimal(status.additionalData!.stopLossLevel!))
            .floor(),
        },
      }
    case DiscoverTableVaultStatus.LIQUIDATED:
      return {
        ...status,
        additionalData: {
          timestamp: status.additionalData!.timestamp! * 1000,
        },
      }
    case DiscoverTableVaultStatus.BEING_LIQUIDATED:
      return {
        ...status,
      }
    default:
      return {
        ...status,
        additionalData: {
          tillLiquidation: item.liquidation_proximity.mul(100).floor(),
        },
      }
  }
}
