import { DiscoverPages, DiscoverTableRowData } from 'features/discover/types'
import { getAssetFilter, getGenericRangeFilter, getTimeSignature } from 'handlers/discover/helpers'
import { NextApiRequest, NextApiResponse } from 'next'
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

type DiscoverResponse = {
  activity?: DiscoverTableRowData['activity']
  collateralType: string
  collateralValue?: number
  collRatio?: number
  liquidationPrice?: number
  liquidationValue?: number
  netValue?: number
  pnl?: number
  positionId: string
  protocolId: string
  status?: DiscoverTableRowData['status']
  vaultDebt?: number
  vaultMultiple?: number
  yield_30d?: number
}

export async function getDiscoverData(req: NextApiRequest, res: NextApiResponse) {
  const { table, asset, size, multiple, time } = querySchema.parse(req.query)

  try {
    let data: DiscoverResponse[] = []

    switch (table) {
      case DiscoverPages.HIGH_RISK_POSITIONS: {
        const resp = await prisma.highRisk.findMany({
          take: AMOUNT_OF_ROWS,
          where: {
            collateral_type: getAssetFilter(asset),
            collateral_value: getGenericRangeFilter(size),
          },
        })
        data = resp.map((i) => ({
          protocolId: i.protocol_id,
          positionId: i.position_id,
          collateralType: i.collateral_type,
          LiquidationPrice: i.liquidation_price.toNumber(),
          liquidationValue: i.liquidation_value.toNumber(),
          status: i.status as DiscoverTableRowData['status'],
        }))
        break
      }
      case DiscoverPages.LARGEST_DEBT: {
        const resp = await prisma.largestDebt.findMany({
          take: AMOUNT_OF_ROWS,
          where: {
            collateral_type: getAssetFilter(asset),
            collateral_value: getGenericRangeFilter(size),
          },
        })
        data = resp.map((i) => ({
          protocolId: i.protocol_id,
          positionId: i.position_id,
          collateralType: i.collateral_type,
          collateralValue: i.collateral_value.toNumber(),
          vaultDebt: i.vault_debt.toNumber(),
          collRatio: i.coll_ratio.toNumber(),
        }))
        break
      }
      case DiscoverPages.HIGHEST_MULTIPLY_PNL: {
        const timeSignature = getTimeSignature('pnl', time)
        const resp = await prisma.highestPnl.findMany({
          take: AMOUNT_OF_ROWS,
          where: {
            collateral_type: getAssetFilter(asset),
            collateral_value: getGenericRangeFilter(size),
            vault_multiple: getGenericRangeFilter(multiple),
          },
          orderBy: { [timeSignature]: 'desc' },
        })
        data = resp.map((i) => ({
          protocolId: i.protocol_id,
          positionId: i.position_id,
          collateralType: i.collateral_type,
          pnl: i[timeSignature].toNumber(),
          vaultMultiple: i.vault_multiple.toNumber(),
          activity: i.last_action as DiscoverTableRowData['activity'],
        }))
        break
      }
      case DiscoverPages.MOST_YIELD_EARNED: {
        const timeSignature = getTimeSignature('pnl', time)
        const resp = await prisma.mostYield.findMany({
          take: AMOUNT_OF_ROWS,
          where: {
            collateral_type: getAssetFilter(asset),
            collateral_value: getGenericRangeFilter(size),
          },
          orderBy: { [timeSignature]: 'desc' },
        })
        data = resp.map((i) => ({
          protocolId: i.protocol_id,
          positionId: i.position_id,
          collateralType: i.collateral_type,
          netValue: i.net_value.toNumber(),
          pnl: i[timeSignature].toNumber(),
          yield_30d: i.yield_30d.toNumber(),
          activity: i.last_action as DiscoverTableRowData['activity'],
        }))
        break
      }
      default:
        break
    }

    if (!data.length) return res.status(404).json({ error: 'discover/no-data-found' })

    return res.status(200).json({ rows: data })
  } catch (error) {
    if (typeof error === 'string') {
      return res.status(500).json({ error })
    } else if (error instanceof Error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
