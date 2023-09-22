import type {
  DiscoverTableActivityRowData,
  DiscoverTableStatusRowData,
} from 'features/discover/types'
import { DiscoverApiErrors, DiscoverPages } from 'features/discover/types'
import {
  getColRatio,
  getGenericArrayFilter,
  getGenericRangeFilter,
  getStatus,
  getTimeSignature,
  wrapFilterCombination,
} from 'handlers/discover/helpers'
import type { NextApiRequest } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const AMOUNT_OF_ROWS = 20

const querySchema = z.object({
  asset: z.string().optional(),
  size: z.string().optional(),
  multiple: z.string().optional(),
  time: z.string().optional(),
  table: z.string().optional(),
})

export async function getDiscoveryData(query: NextApiRequest['query']) {
  const { table, asset, size, multiple, time } = querySchema.parse(query)

  try {
    switch (table) {
      case DiscoverPages.HIGHEST_RISK_POSITIONS:
        return {
          rows: (
            await prisma.highestRiskPositions.findMany({
              take: AMOUNT_OF_ROWS,
              where: {
                token: getGenericArrayFilter(asset),
                OR: wrapFilterCombination('collateral_value', getGenericRangeFilter, size),
              },
              orderBy: { liquidation_proximity: 'asc' },
            })
          ).map((item) => ({
            asset: item.token,
            liquidationPrice: item.liquidation_price.toNumber(),
            nextOsmPrice: item.next_price.toNumber(),
            maxLiquidationAmount: item.liquidation_value.toNumber(),
            status: getStatus(item) as DiscoverTableStatusRowData,
            cdpId: item.position_id,
          })),
        }
      case DiscoverPages.HIGHEST_MULTIPLY_PNL: {
        const timeSignature = getTimeSignature('pnl', time)

        return {
          rows: (
            await prisma.highestMultiplyPnl.findMany({
              take: AMOUNT_OF_ROWS,
              where: {
                token: getGenericArrayFilter(asset),
                AND: [
                  { OR: wrapFilterCombination('collateral_value', getGenericRangeFilter, size) },
                  { OR: wrapFilterCombination('vault_multiple', getGenericRangeFilter, multiple) },
                ],
                type: 'multiply',
              },
              orderBy: { [timeSignature]: 'desc' },
            })
          ).map((item) => ({
            asset: item.token,
            collateralValue: item.collateral_value.toNumber(),
            currentMultiple: item.vault_multiple.toNumber(),
            pnl: item[timeSignature].times(100).toNumber(),
            activity: item.last_action as DiscoverTableActivityRowData,
            cdpId: item.position_id,
          })),
        }
      }
      case DiscoverPages.MOST_YIELD_EARNED: {
        const timeSignature = getTimeSignature('pnl', time)

        return {
          rows: (
            await prisma.mostYieldEarned.findMany({
              take: AMOUNT_OF_ROWS,
              where: {
                token: getGenericArrayFilter(asset),
                OR: wrapFilterCombination('collateral_value', getGenericRangeFilter, size),
              },
              orderBy: { [timeSignature]: 'desc' },
            })
          ).map((item) => ({
            asset: item.token,
            netValue: item.net_value.toNumber(),
            earningsToDate: item[timeSignature].toNumber(),
            '30DayAvgApy': item.yield_30d.times(100).toNumber(),
            activity: item.last_action as DiscoverTableActivityRowData,
            cdpId: item.position_id,
          })),
        }
      }
      case DiscoverPages.LARGEST_DEBT:
        return {
          rows: (
            await prisma.largestDebt.findMany({
              take: AMOUNT_OF_ROWS,
              where: {
                token: getGenericArrayFilter(asset),
                OR: wrapFilterCombination('collateral_value', getGenericRangeFilter, size),
              },
              orderBy: { vault_debt: 'desc' },
            })
          ).map((item) => ({
            asset: item.token,
            collateralValue: item.collateral_value.toNumber(),
            vaultDebt: item.vault_debt.toNumber(),
            colRatio: getColRatio(item),
            activity: item.last_action as DiscoverTableActivityRowData,
            cdpId: item.position_id,
          })),
        }
      default:
        return {
          error: { code: DiscoverApiErrors.NO_ENTRIES, reason: 'discover/no-data-found' },
        }
    }
  } catch (error) {
    return {
      error: { code: DiscoverApiErrors.UNKNOWN_ERROR, reason: 'discover/unknown-error' },
    }
  }
}
