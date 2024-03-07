import type { ProductHubQueryString } from 'features/productHub/types'
import type { useSearchParams } from 'next/navigation'

export function getInitialQueryString(
  searchParams: ReturnType<typeof useSearchParams>,
): ProductHubQueryString {
  return {
    ...(searchParams.has('debtToken') && { debtToken: searchParams.get('debtToken')?.split(',') }),
    ...(searchParams.has('network') && {
      network: searchParams.get('network')?.split(',') as ProductHubQueryString['network'],
    }),
    ...(searchParams.has('protocol') && {
      protocol: searchParams.get('protocol')?.split(',') as ProductHubQueryString['protocol'],
    }),
    ...(searchParams.has('secondaryToken') && {
      secondaryToken: searchParams.get('secondaryToken')?.split(','),
    }),
    ...(searchParams.has('strategy') && {
      strategy: searchParams.get('strategy')?.split(',') as ProductHubQueryString['strategy'],
    }),
    ...(searchParams.has('rewardsOnly') && {
      rewardsOnly: [true],
    }),
  }
}
