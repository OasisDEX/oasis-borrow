import {HighestPnl, HighRisk} from '@prisma/client'
import { DiscoverDataResponse } from 'features/discover/api'
import {
  DiscoverPages,
  DiscoverTableRowHighRisk,
  DiscoverTableRowLargestDebt,
} from 'features/discover/types'
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

export async function getDiscoverDatabaseData(
  kind: string,
  query: NextApiRequest['query'],
): Promise<DiscoverDataResponse> {
  const { asset, multiple, size, time } = querySchema.parse(query)

  switch (kind) {
    case DiscoverPages.HIGH_RISK_POSITIONS: {
      const response = await prisma.highRisk.findMany({
        take: AMOUNT_OF_ROWS,
        where: {
          collateral_type: getAssetFilter(asset),
          collateral_value: getGenericRangeFilter(size),
        },
        orderBy: { liquidation_value: 'desc' },
        select: {
          protocol_id: true,
          position_id: true,
          collateral_type: true,
          liquidation_price: true,
          liquidation_value: true,
          next_price: true,
          status: true,
        },
      })

      return {
        rows: response.map((item) => ({
          asset: item.collateral_type,
          liquidationPrice: Number(item.liquidation_price),
          nextOsmPrice: Number(item.next_price),
          maxLiquidationAmount: Number(item.liquidation_value),
          status: item.status as DiscoverTableRowHighRisk['status'],
          cdpId: Number(item.position_id),
        })),
      }
    }
    case DiscoverPages.HIGHEST_MULTIPLY_PNL: {
      const timeSignature = getTimeSignature(time)

      const response = await prisma.highestPnl.findMany({
        take: AMOUNT_OF_ROWS,
        where: {
          collateral_type: getAssetFilter(asset),
          collateral_value: getGenericRangeFilter(size),
          vault_multiple: getGenericRangeFilter(multiple),
        },
        orderBy: { [timeSignature]: 'desc' },
        select: {
          protocol_id: true,
          position_id: true,
          collateral_type: true,
          vault_multiple: true,
          [timeSignature]: true,
          last_action: true,
        },
      }) as HighestPnl[]

      return {
        rows: response.map((item) => ({
          asset: item.collateral_type,
          collateralValue: Number(item.collateral_value),
          vaultDebt: Number(item.vault_debt),
          colRatio: {
            level: Number(item.coll_ratio),
            // TODO: calculate this value
            isAtRisk: false,
          },
          activity: item.last_action as DiscoverTableRowLargestDebt['activity'],
          cdpId: Number(item.position_id),
        })),
      }
    }
    case DiscoverPages.LARGEST_DEBT: {
      const response = await prisma.largestDebt.findMany({
        take: AMOUNT_OF_ROWS,
        where: {
          collateral_type: getAssetFilter(asset),
          collateral_value: getGenericRangeFilter(size),
        },
        orderBy: { vault_debt: 'desc' },
        select: {
          protocol_id: true,
          position_id: true,
          collateral_type: true,
          collateral_value: true,
          vault_debt: true,
          coll_ratio: true,
          last_action: true,
        },
      })

      return {
        rows: response.map((item) => ({
          asset: item.collateral_type,
          collateralValue: Number(item.collateral_value),
          vaultDebt: Number(item.vault_debt),
          colRatio: {
            level: Number(item.coll_ratio),
            // TODO: calculate this value
            isAtRisk: false,
          },
          activity: item.last_action as DiscoverTableRowLargestDebt['activity'],
          cdpId: Number(item.position_id),
        })),
      }
    }
    default:
      return undefined
  }
}
