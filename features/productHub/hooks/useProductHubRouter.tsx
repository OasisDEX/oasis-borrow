import { ALL_ASSETS } from 'features/productHub/meta'
import type { ProductHubProductType, ProductHubQueryString } from 'features/productHub/types'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

interface useProductHubRouterProps {
  queryString: ProductHubQueryString
  selectedProduct: ProductHubProductType
  selectedToken?: string
  url?: string
}

export const useProductHubRouter = ({
  queryString,
  selectedProduct,
  selectedToken,
  url,
}: useProductHubRouterProps) => {
  const { replace } = useRouter()

  const tokenInUrl = useMemo(
    () => (selectedToken === ALL_ASSETS ? '' : `/${selectedToken}`),
    [selectedToken],
  )
  const pathname = useMemo(
    () => `${url}${selectedProduct}${tokenInUrl}`,
    [selectedProduct, tokenInUrl, url],
  )
  const query = useMemo(
    () =>
      Object.keys(queryString).reduce<{ [key in keyof ProductHubQueryString]: string | undefined }>(
        (sum, key) => ({
          ...sum,
          [key]: queryString[key as keyof typeof queryString]?.join(','),
        }),
        {},
      ),
    [queryString],
  )

  useEffect(() => {
    if (url) void replace({ pathname, query }, undefined, { shallow: true })
  }, [pathname, query, url])
}
