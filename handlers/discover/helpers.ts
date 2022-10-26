import { HighestPnl, MostYield, Prisma } from '@prisma/client'
import { discoverFiltersAssetItems } from 'features/discover/filters'
import { values } from 'lodash'

type OmitNonDecimal<T> = { [K in keyof T]: T[K] extends Prisma.Decimal ? K : never }[keyof T]
type DiscoverLite = OmitNonDecimal<HighestPnl | MostYield>

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

export function getAssetFilter(asset?: string): Prisma.StringFilter {
  return !asset || asset === 'all'
    ? {
        in: values(discoverFiltersAssetItems)
          .map((item) => item.value)
          .filter((item) => item !== 'all'),
      }
    : { equals: asset }
}

export function getTimeSignature(prefix: string, time?: string): DiscoverLite {
  if (time && ELIGIBLE_TIME_SIGNATURES.includes(time)) return `${prefix}_${time}` as DiscoverLite
  else return `${prefix}_all` as DiscoverLite
}
