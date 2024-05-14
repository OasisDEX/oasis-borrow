import type { NavigationFeaturedProduct } from 'handlers/navigation/types'

export function mapFeaturedProductToFilterCriteria(item: NavigationFeaturedProduct) {
  const {
    primaryToken,
    secondaryToken,
    detailedFilters,
    label,
    network: { slug: network },
    product: { slug: product },
    protocol: { slug: protocol },
  } = item

  return {
    network,
    primaryToken,
    product,
    protocol,
    secondaryToken,
    ...(label && label !== null && { label }),
    ...(detailedFilters &&
      detailedFilters !== null &&
      Object.values(detailedFilters).reduce<{ [key: string]: string }>(
        (total, { key, value }) => ({ ...total, [key]: value }),
        {},
      )),
  }
}
