import type { AxiosResponse } from 'axios';
import axios from 'axios'
import { isTestnetNetworkId } from 'blockchain/networks'
import type { ProductHubData } from 'features/productHub/types'
import { useWalletManagement } from 'features/web3OnBoard'
import type { ProductHubDataParams, PromoCardsCollection } from 'handlers/product-hub/types'
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
  const { chainId } = useWalletManagement()
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
          protocols: protocols.filter((p) => p), // could be false cause of disabled protocols
          promoCardsCollection,
          testnet: isTestnetNetworkId(chainId),
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
