import axios, { AxiosResponse } from 'axios'
import { isTestnetNetworkId, NetworkIds, useCustomNetworkParameter } from 'blockchain/networks'
import { ProductHubData } from 'features/productHub/types'
import { ProductHubDataParams, PromoCardsCollection } from 'handlers/product-hub/types'
import { useCallback, useEffect, useState } from 'react'

export interface ProductHubDataState {
  data?: ProductHubData
  isError: boolean
  isLoading: boolean
  refetch(): void
}

type ProductHubDataWithCards = ProductHubDataParams & {
  promoCardsCollection: PromoCardsCollection
}

export const useProductHubData = ({
  protocols,
  promoCardsCollection,
}: ProductHubDataWithCards): ProductHubDataState => {
  const [networkParameter] = useCustomNetworkParameter()
  const [state, setState] = useState<ProductHubDataState>({
    isError: false,
    isLoading: true,
    refetch: () => {},
  })

  const fetchData = useCallback(async (): Promise<void> => {
    setState({
      ...state,
      isLoading: true,
    })

    axios
      .request<ProductHubDataWithCards, AxiosResponse<ProductHubData>>({
        method: 'post',
        url: '/api/product-hub',
        responseType: 'json',
        headers: { Accept: 'application/json' },
        data: {
          protocols,
          promoCardsCollection,
          testnet: isTestnetNetworkId(networkParameter?.id ?? NetworkIds.MAINNET),
        },
      })
      .then(({ data }) => {
        setState({
          ...state,
          data,
          isError: false,
          isLoading: false,
        })
      })
      .catch(() => {
        setState({
          ...state,
          data: undefined,
          isError: true,
          isLoading: false,
        })
      })
  }, [protocols.map((p) => p).join('-'), promoCardsCollection])

  useEffect(() => void fetchData(), [fetchData])

  return {
    ...state,
    refetch: useCallback(() => fetchData(), [fetchData]),
  }
}
