import { HighestPnl, HighRisk, LargestDebt, MostYield, Prisma } from '@prisma/client'
import { discoverFiltersAssetItems } from 'features/discover/filters'
import { DiscoverApiErrors, DiscoverPages } from 'features/discover/types'
import { getDiscoverDatabaseData } from 'handlers/discover/dataHandlers'
import { getDiscoverApiErrorResponse } from 'handlers/discover/helpers'
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
      return { t_1d: 'desc' }
    }
    case '7d': {
      return { t_7d: 'desc' }
    }
    case '30d': {
      return { t_30d: 'desc' }
    }
    case '1y': {
      return { t_365d: 'desc' }
    }
    default: {
      return { t_all: 'desc' }
    }
  }
}

export async function getDiscoverData(req: NextApiRequest, res: NextApiResponse) {
  const { table, asset, size, multiple, time } = querySchema.parse(req.query)

  const assetFilter = getAssetFilter(asset)
  const sizeFilter = getSizeFilter(size)
  const multipleFilter = getMultipleFilter(multiple)
  const timeFilter = getTimeFilter(time)
  const timeIndex = Object.keys(timeFilter)[0]

  if (table && Object.values<string>(DiscoverPages).includes(table)) {
    const response = await getDiscoverDatabaseData(table, req.query)

    return res.status(200).json(response)
  }

  try {
    let data: HighRisk[] | LargestDebt[] | HighestPnl[] | MostYield[] = []

    switch (table) {
      case DiscoverPages.HIGH_RISK_POSITIONS:
        data = (await prisma.highRisk.findMany({
          take: AMOUNT_OF_ROWS,
          where: { collateral_type: assetFilter, collateral_value: sizeFilter },
          select: {
            protocol_id: true,
            position_id: true,
            collateral_type: true,
            liquidation_price: true,
            liquidation_value: true,
            next_price: true,
            status: true,
          },
        })) as HighRisk[]

        break
      case DiscoverPages.LARGEST_DEBT:
        data = (await prisma.largestDebt.findMany({
          take: AMOUNT_OF_ROWS,
          where: { collateral_type: assetFilter, collateral_value: sizeFilter },
          select: {
            protocol_id: true,
            position_id: true,
            collateral_type: true,
            collateral_value: true,
            vault_debt: true,
            coll_ratio: true,
            last_action: true,
          },
        })) as LargestDebt[]

        break
      case DiscoverPages.HIGHEST_MULTIPLY_PNL:
        data = (await prisma.highestPnl.findMany({
          take: AMOUNT_OF_ROWS,
          where: {
            collateral_type: assetFilter,
            collateral_value: sizeFilter,
            vault_multiple: multipleFilter,
          },
          orderBy: timeFilter,
          select: {
            protocol_id: true,
            position_id: true,
            collateral_type: true,
            vault_multiple: true,
            [timeIndex]: true,
            last_action: true,
          },
        })) as HighestPnl[]
        break
      case DiscoverPages.MOST_YIELD_EARNED:
        data = (await prisma.mostYield.findMany({
          take: AMOUNT_OF_ROWS,
          where: { collateral_type: assetFilter, collateral_value: sizeFilter },
          orderBy: timeFilter,
          select: {
            protocol_id: true,
            position_id: true,
            collateral_type: true,
            net_value: true,
            [timeIndex]: true,
            yield_30d: true,
            last_action: true,
          },
        })) as MostYield[]
        break
      default:
        break
    }

    return data.length
      ? res.status(200).json({ rows: data })
      : res.status(404).json(getDiscoverApiErrorResponse(DiscoverApiErrors.NO_DATA))
  } catch {
    return res.status(500).json(getDiscoverApiErrorResponse(DiscoverApiErrors.UNKNOWN_ERROR))
  }
}
