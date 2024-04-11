import { isTestnetNetworkId, NetworkIds } from 'blockchain/networks'
import { GenericMultiselect } from 'components/GenericMultiselect'
import { getTokensFilterOptions } from 'features/productHub/helpers'
import {
  productHubNetworkFilter,
  productHubProtocolFilter,
  productHubTestNetworkFilter,
} from 'features/productHub/meta'
import type {
  ProductHubFilters,
  ProductHubItem,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export interface ProductHubFiltersParams {
  data: ProductHubItem[]
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters) => void
  selectedFilters: ProductHubFilters
}

export const useProductHubFilters = ({
  data,
  // initialNetwork,
  // initialProtocol,
  networkId,
  onChange,
  selectedFilters,
}: ProductHubFiltersParams) => {
  const { t } = useTranslation()

  const isTestnet = isTestnetNetworkId(networkId ?? NetworkIds.MAINNET)

  const collateralTokens = useMemo(
    () => getTokensFilterOptions({ data, key: 'primaryToken' }),
    [data],
  )
  const debtTokens = useMemo(() => getTokensFilterOptions({ data, key: 'secondaryToken' }), [data])
  const depositTokens = useMemo(() => getTokensFilterOptions({ data, key: 'depositToken' }), [data])

  const collateralTokenFilterLabel = t('product-hub.filters.collateral-tokens')
  const debtTokenFilterLabel = t('product-hub.filters.debt-tokens')
  const depositTokenFilterLabel = t('product-hub.filters.deposit-tokens')
  const networkFilterLabel = t('product-hub.filters.networks')
  const protocolFilterLabel = t('product-hub.filters.protocols')

  const collateralTokenFilter = useMemo(
    () => (
      <GenericMultiselect
        label={collateralTokenFilterLabel}
        options={collateralTokens}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            primaryToken: value,
          })
        }}
      />
    ),
    [collateralTokenFilterLabel, collateralTokens, onChange, selectedFilters],
  )
  const debtTokenFilter = useMemo(
    () => (
      <GenericMultiselect
        label={debtTokenFilterLabel}
        options={debtTokens}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            secondaryToken: value,
          })
        }}
      />
    ),
    [debtTokenFilterLabel, debtTokens, onChange, selectedFilters],
  )
  const depositTokenFilter = useMemo(
    () => (
      <GenericMultiselect
        label={depositTokenFilterLabel}
        options={depositTokens}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            depositToken: value,
          })
        }}
      />
    ),
    [depositTokenFilterLabel, depositTokens, onChange, selectedFilters],
  )
  const networkFilter = useMemo(
    () => (
      <GenericMultiselect
        label={networkFilterLabel}
        options={isTestnet ? productHubTestNetworkFilter : productHubNetworkFilter}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            network: value as ProductHubSupportedNetworks[],
          })
        }}
      />
    ),
    [isTestnet, networkFilterLabel, onChange, selectedFilters],
  )
  const protocolFilter = useMemo(
    () => (
      <GenericMultiselect
        label={protocolFilterLabel}
        options={productHubProtocolFilter}
        fitContents
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            protocol: value as LendingProtocol[],
          })
        }}
      />
    ),
    [onChange, protocolFilterLabel, selectedFilters],
  )

  return {
    collateralTokenFilter,
    debtTokenFilter,
    depositTokenFilter,
    networkFilter,
    protocolFilter,
  }
}
