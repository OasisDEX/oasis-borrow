import axios, { AxiosResponse } from 'axios'
import { ProductHubData } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import { useCallback, useEffect, useState } from 'react'

interface ProductHubDataParams {
  protocol: LendingProtocol | LendingProtocol[]
}

export interface ProductHubDataState {
  data?: ProductHubData
  isError: boolean
  isLoading: boolean
  refetch(): void
}

export const useProductHubData = ({ protocol }: ProductHubDataParams): ProductHubDataState => {
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
      .request<ProductHubDataParams, AxiosResponse<ProductHubData>>({
        method: 'post',
        url: '/api/product-hub',
        responseType: 'json',
        headers: { Accept: 'application/json' },
        data: { protocol },
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
  }, [protocol])

  useEffect(() => void fetchData(), [fetchData])

  return {
    ...state,
    refetch: useCallback(() => fetchData(), [fetchData]),
  }
}
