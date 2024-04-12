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
        initialValues={selectedFilters['collateral-token'] ?? []}
        label={collateralTokenFilterLabel}
        options={collateralTokens}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            'collateral-token': value,
          })
        }}
      />
    ),
    [collateralTokenFilterLabel, collateralTokens, onChange, selectedFilters],
  )
  const debtTokenFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={selectedFilters['debt-token'] ?? []}
        label={debtTokenFilterLabel}
        options={debtTokens}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            'debt-token': value,
          })
        }}
      />
    ),
    [debtTokenFilterLabel, debtTokens, onChange, selectedFilters],
  )
  const depositTokenFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={selectedFilters['deposit-token'] ?? []}
        label={depositTokenFilterLabel}
        options={depositTokens}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            'deposit-token': value,
          })
        }}
      />
    ),
    [depositTokenFilterLabel, depositTokens, onChange, selectedFilters],
  )
  const protocolFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={selectedFilters['protocol'] ?? []}
        label={protocolFilterLabel}
        options={productHubProtocolFilter}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            protocol: value,
          })
        }}
      />
    ),
    [onChange, protocolFilterLabel, selectedFilters],
  )
  const networkFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={selectedFilters['network'] ?? []}
        label={networkFilterLabel}
        options={isTestnet ? productHubTestNetworkFilter : productHubNetworkFilter}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            network: value,
          })
        }}
      />
    ),
    [isTestnet, networkFilterLabel, onChange, selectedFilters],
  )

  return {
    collateralTokenFilter,
    debtTokenFilter,
    depositTokenFilter,
    networkFilter,
    protocolFilter,
  }
}
