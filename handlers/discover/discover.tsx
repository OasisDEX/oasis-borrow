import { HighestPnl, HighRisk, LargestDebt, MostYield, Prisma } from '@prisma/client'
import { DiscoveryPages } from 'features/discovery/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const querySchema = z.object({
  table: z.string(),
  asset: z.string(),
  size: z.string(),
  multiple: z.string(),
  time: z.string(),
})

const getTimeFilter = (time: string): { [key: string]: 'desc' } => {
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
    case 'all': {
      return { t_all: 'desc' }
    }
    default: {
      return { t_all: 'desc' }
    }
  }
}

const getSizeFilter = (size: string): Prisma.StringFilter => {
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
const getMultipleFilter = (time: string): Prisma.StringFilter => {
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

export async function getDiscoverData(req: NextApiRequest, res: NextApiResponse) {
  const { table, asset, size, multiple, time } = querySchema.parse(req.query)

  const sizeFilter = getSizeFilter(size)
  const timeFilter = getTimeFilter(time)
  const multipleFilter = getMultipleFilter(multiple)
  const assetFilter: string = asset.toUpperCase() || 'all'
  const timeIndex = Object.keys(timeFilter)[0]
  try {
    let data: HighRisk[] | LargestDebt[] | HighestPnl[] | MostYield[] = []
    switch (table) {
      case DiscoveryPages.HIGH_RISK_POSITIONS: {
        data = (await prisma.highRisk.findMany({
          take: 10,
          where: { collateral_type: assetFilter, collateral_value: sizeFilter },
          select: {
            protocol_id: true,
            position_id: true,
            collateral_type: true,
            liquidation_price: true,
            liquidation_value: true,
            status: true,
          },
        })) as HighRisk[]
        break
      }
      case DiscoveryPages.LARGEST_DEBT: {
        data = (await prisma.largestDebt.findMany({
          take: 10,
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
      }
      case DiscoveryPages.HIGHEST_MULTIPLY_PNL: {
        data = (await prisma.highestPnl.findMany({
          take: 10,
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
        data.map((e: any) => {
          const replacedData = e[timeIndex]
          delete e[timeIndex]
          e['pnl'] = replacedData
        })
        break
      }
      case DiscoveryPages.MOST_YIELD_EARNED: {
        data = (await prisma.mostYield.findMany({
          take: 10,
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
        data.map((e: any) => {
          const replacedData = e[timeIndex]
          delete e[timeIndex]
          e['earned'] = replacedData
        })
        break
      }
      default: {
        break
      }
    }

    if (!data.length) return res.status(404).json({ error: 'discover/no-data-found' })

    return res.status(200).json(data)
  } catch (error) {
    // @ts-ignore
    return res.status(500).json({ error: error.message || error.toString() })
  }
}
