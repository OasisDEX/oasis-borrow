import { Prisma } from '@prisma/client'
import { DiscoverDataResponse } from 'features/discover/api'
import { discoverFiltersAssetItems } from 'features/discover/filters'
import { DiscoverApiErrors } from 'features/discover/types'
import { values } from 'lodash'

export function getDiscoverApiErrorResponse(code: DiscoverApiErrors): DiscoverDataResponse {
  return { error: { code } }
}

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
    : { equals: asset.toUpperCase() }
}

export function getTimeSignature(time?: string): string {
  const eligibleSignatures = ['1d', '7d', '30d', '365d']

  if (time && eligibleSignatures.includes(time)) return `t_${time}`
  else return 't_all'
}
