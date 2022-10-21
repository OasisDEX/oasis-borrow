import { HighestPnl, MostYield, Prisma } from '@prisma/client'
import { discoverFiltersAssetItems } from 'features/discover/filters'
import {
  DiscoverPages,
  DiscoverTableVaultActivity,
  DiscoverTableVaultStatus,
} from 'features/discover/types'
import { values } from 'lodash'
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

type OmitNonDecimal<T> = { [K in keyof T]: T[K] extends Prisma.Decimal ? K : never }[keyof T]
type DiscoverLite = OmitNonDecimal<HighestPnl | MostYield>

type Status = {
  kind: DiscoverTableVaultActivity
  additionalData: {
    toStopLoss?: number
    tillLiquidation?: number
  }
}
type Activity = {
  kind: DiscoverTableVaultStatus
  additionalData: {
    timestamp?: number
  }
}
type DiscoverResponse = {
  protocolId: string
  positionId: string
  collateralType: string
  collateralValue?: number
  liquidationPrice?: number
  liquidationValue?: number
  vaultDebt?: number
  collRatio?: number
  netValue?: number
  pnl?: number
  yield_30d?: number
  vaultMultiple?: number
  status?: Status
  activity?: Activity
}

const getAssetFilter = (asset?: string): string | Prisma.StringFilter => {
  return !asset || asset === 'all'
    ? {
        in: values(discoverFiltersAssetItems)
          .map((item) => item.value)
          .filter((item) => item !== 'all'),
      }
    : asset.toUpperCase()
}
const getSizeFilter = (size?: string): Prisma.StringFilter => {
  switch (size) {
    case '<100k': {
      return { lt: '100000' }
    }
    case '100k-250k': {
      return { gt: '100000', lt: '250000' }
    }
    case '250k-500k': {
      return { gt: '250000', lt: '500000' }
    }
    case '500k-1m': {
      return { gt: '500000', lt: '1000000' }
    }
    case '>1m': {
      return { gt: '1000000' }
    }
    default: {
      return { gt: '0' }
    }
  }
}
const getMultipleFilter = (time?: string): Prisma.StringFilter => {
  switch (time) {
    case '1-2': {
      return { gte: '1', lt: '2' }
    }
    case '2-3': {
      return { gte: '2', lt: '3' }
    }
    case '>3': {
      return { gte: '3' }
    }
    default: {
      return { gte: '1' }
    }
  }
}
const getTimeFilter = (time?: string): { [key: string]: 'desc' } => {
  switch (time) {
    case '1d': {
      return { pnl_1d: 'desc' }
    }
    case '7d': {
      return { pnl_7d: 'desc' }
    }
    case '30d': {
      return { pnl_30d: 'desc' }
    }
    case '1y': {
      return { pnl_365d: 'desc' }
    }
    default: {
      return { pnl_all: 'desc' }
    }
  }
}

export async function getDiscoverData(req: NextApiRequest, res: NextApiResponse) {
  const { table, asset, size, multiple, time } = querySchema.parse(req.query)

  const assetFilter = getAssetFilter(asset)
  const sizeFilter = getSizeFilter(size)
  const multipleFilter = getMultipleFilter(multiple)
  const timeFilter = getTimeFilter(time)
  const timeIndex = Object.keys(timeFilter)[0] as DiscoverLite

  try {
    let data: DiscoverResponse[] = []

    switch (table) {
      case DiscoverPages.HIGH_RISK_POSITIONS: {
        const resp = await prisma.highRisk.findMany({
          take: AMOUNT_OF_ROWS,
          where: { collateral_type: assetFilter, collateral_value: sizeFilter },
        })
        data = resp.map((i) => ({
          protocolId: i.protocol_id,
          positionId: i.position_id,
          collateralType: i.collateral_type,
          LiquidationPrice: i.liquidation_price.toNumber(),
          liquidationValue: i.liquidation_value.toNumber(),
          status: i.status as Status,
        }))
        break
      }
      case DiscoverPages.LARGEST_DEBT: {
        const resp = await prisma.largestDebt.findMany({
          take: AMOUNT_OF_ROWS,
          where: { collateral_type: assetFilter, collateral_value: sizeFilter },
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
        const resp = await prisma.highestPnl.findMany({
          take: AMOUNT_OF_ROWS,
          where: {
            collateral_type: assetFilter,
            collateral_value: sizeFilter,
            vault_multiple: multipleFilter,
          },
          orderBy: timeFilter,
        })
        data = resp.map((i) => ({
          protocolId: i.protocol_id,
          positionId: i.position_id,
          collateralType: i.collateral_type,
          pnl: i[timeIndex].toNumber(),
          vaultMultiple: i.vault_multiple.toNumber(),
          activity: i.last_action as Activity,
        }))
        break
      }
      case DiscoverPages.MOST_YIELD_EARNED: {
        const resp = await prisma.mostYield.findMany({
          take: AMOUNT_OF_ROWS,
          where: { collateral_type: assetFilter, collateral_value: sizeFilter },
          orderBy: timeFilter,
        })
        data = resp.map((i) => ({
          protocolId: i.protocol_id,
          positionId: i.position_id,
          collateralType: i.collateral_type,
          netValue: i.net_value.toNumber(),
          pnl: i[timeIndex].toNumber(),
          yield_30d: i.yield_30d.toNumber(),
          activity: i.last_action as Activity,
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
