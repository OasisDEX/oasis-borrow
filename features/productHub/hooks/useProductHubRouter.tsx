import type { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubFilters } from 'features/productHub/types'
import { useRouter } from 'next/router'
import type { ParsedUrlQueryInput } from 'querystring'
import { useEffect, useMemo } from 'react'

interface UseProductHubRouterProps {
  selectedFilters: ProductHubFilters
  selectedProduct: OmniProductType
  url?: string
}

export const useProductHubRouter = ({
  selectedFilters,
  selectedProduct,
  url,
}: UseProductHubRouterProps) => {
  const { replace } = useRouter()

  const query = useMemo(() => {
    return Object.entries(selectedFilters).reduce<ParsedUrlQueryInput>(
      (total, [key, value]) => ({
        ...total,
        ...(value.length && {
          [key]: value.join(','),
        }),
      }),
      {},
    )
  }, [selectedFilters, selectedProduct])

  useEffect(() => {
    if (url)
      void replace({ pathname: `${url}${selectedProduct}`, query }, undefined, { shallow: true })
  }, [query, selectedProduct, url])

  return {
    query,
  }
}
