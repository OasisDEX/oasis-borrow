import { DiscoverApiErrors, DiscoverPages, DiscoverTableRowData } from 'features/discover/types'
import { getAssetFilter, getGenericRangeFilter, getTimeSignature } from 'handlers/discover/helpers'
import { NextApiRequest } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const AMOUNT_OF_ROWS = 10

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
      case DiscoverPages.HIGH_RISK_POSITIONS:
        return {
          rows: (
            await prisma.highRisk.findMany({
              take: AMOUNT_OF_ROWS,
              where: {
                collateral_type: getAssetFilter(asset),
                collateral_value: getGenericRangeFilter(size),
              },
            })
          ).map((item) => ({
            asset: item.collateral_type,
            liquidationPrice: item.liquidation_price.toNumber(),
            nextOsmPrice: item.next_price.toNumber(),
            maxLiquidationAmount: item.liquidation_value.toNumber(),
            status: item.status as DiscoverTableRowData['status'],
            cdpId: item.position_id,
          })),
        }
      case DiscoverPages.HIGHEST_MULTIPLY_PNL: {
        const timeSignature = getTimeSignature('pnl', time)

        return {
          rows: (
            await prisma.highestPnl.findMany({
              take: AMOUNT_OF_ROWS,
              where: {
                collateral_type: getAssetFilter(asset),
                collateral_value: getGenericRangeFilter(size),
                vault_multiple: getGenericRangeFilter(multiple),
              },
              orderBy: { [timeSignature]: 'desc' },
            })
          ).map((item) => ({
            asset: item.collateral_type,
            collateralValue: item.collateral_value.toNumber(),
            currentMultiple: item.vault_multiple.toNumber(),
            pnl: item[timeSignature].toNumber(),
            activity: item.last_action as DiscoverTableRowData['activity'],
            cdpId: item.position_id,
          })),
        }
      }
      case DiscoverPages.MOST_YIELD_EARNED: {
        const timeSignature = getTimeSignature('pnl', time)

        return {
          rows: (
            await prisma.mostYield.findMany({
              take: AMOUNT_OF_ROWS,
              where: {
                collateral_type: getAssetFilter(asset),
                collateral_value: getGenericRangeFilter(size),
              },
              orderBy: { [timeSignature]: 'desc' },
            })
          ).map((item) => ({
            asset: item.collateral_type,
            netValue: item.net_value.toNumber(),
            earningsToDate: item[timeSignature].toNumber(),
            '30DayAvgApy': item.yield_30d.toNumber(),
            activity: item.last_action as DiscoverTableRowData['activity'],
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
                collateral_type: getAssetFilter(asset),
                collateral_value: getGenericRangeFilter(size),
              },
            })
          ).map((item) => ({
            asset: item.collateral_type,
            collateralValue: item.collateral_value.toNumber(),
            vaultDebt: item.vault_debt.toNumber(),
            colRatio: {
              level: item.coll_ratio.toNumber(),
              // TODO: isAtRisk needs to be calculated on view level, but not enough data is available right now
              isAtRiskDanger: false,
              isAtRiskWarning: false,
            },
            activity: item.last_action as DiscoverTableRowData['activity'],
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
