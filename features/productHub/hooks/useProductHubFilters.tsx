import { isTestnetNetworkId, NetworkIds } from 'blockchain/networks'
import { GenericMultiselect } from 'components/GenericMultiselect'
import { TOKENS_STABLE_GROUPS } from 'features/productHub/filterGroups'
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
import { getTokenGroup } from 'handlers/product-hub/helpers'
import type { LendingProtocol } from 'lendingProtocols'
import { intersectionWith } from 'lodash'
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

  const ethCollateralTokens = useMemo(
    () =>
      collateralTokens
        .filter(({ value }) => [getTokenGroup(value), value].includes('ETH'))
        .map(({ value }) => value),
    [collateralTokens],
  )
  const stableCollateralTokens = useMemo(
    () =>
      collateralTokens
        .filter(
          ({ value }) =>
            !!intersectionWith([getTokenGroup(value), value], TOKENS_STABLE_GROUPS).length,
        )
        .map(({ value }) => value),
    [collateralTokens],
  )
  const stableDebtTokens = useMemo(
    () =>
      debtTokens
        .filter(
          ({ value }) =>
            !!intersectionWith([getTokenGroup(value), value], TOKENS_STABLE_GROUPS).length,
        )
        .map(({ value }) => value),
    [debtTokens],
  )
  const ethDepositTokens = useMemo(
    () =>
      depositTokens
        .filter(({ value }) => [getTokenGroup(value), value].includes('ETH'))
        .map(({ value }) => value),
    [depositTokens],
  )
  const stableDepositTokens = useMemo(
    () =>
      depositTokens
        .filter(
          ({ value }) =>
            !!intersectionWith([getTokenGroup(value), value], TOKENS_STABLE_GROUPS).length,
        )
        .map(({ value }) => value),
    [depositTokens],
  )

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
        optionGroups={[
          {
            id: 'eth-variants',
            key: 'product-hub.filters.eth-variants',
            options: ethCollateralTokens,
          },
          {
            id: 'stablecoins',
            key: 'product-hub.filters.stablecoins',
            options: stableCollateralTokens,
          },
        ]}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            'collateral-token': value,
          })
        }}
        withSearch
      />
    ),
    [
      collateralTokenFilterLabel,
      collateralTokens,
      ethCollateralTokens,
      onChange,
      selectedFilters,
      stableCollateralTokens,
    ],
  )
  const debtTokenFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={selectedFilters['debt-token'] ?? []}
        label={debtTokenFilterLabel}
        options={debtTokens}
        optionGroups={[
          {
            id: 'stablecoins',
            key: 'product-hub.filters.stablecoins',
            options: stableDebtTokens,
          },
        ]}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            'debt-token': value,
          })
        }}
        withSearch
      />
    ),
    [debtTokenFilterLabel, debtTokens, selectedFilters, stableDebtTokens],
  )
  const depositTokenFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={selectedFilters['deposit-token'] ?? []}
        label={depositTokenFilterLabel}
        options={depositTokens}
        optionGroups={[
          {
            id: 'eth-variants',
            key: 'product-hub.filters.eth-variants',
            options: ethDepositTokens,
          },
          {
            id: 'stablecoins',
            key: 'product-hub.filters.stablecoins',
            options: stableDepositTokens,
          },
        ]}
        onChange={(value) => {
          onChange({
            ...selectedFilters,
            'deposit-token': value,
          })
        }}
        withSearch
      />
    ),
    [depositTokenFilterLabel, depositTokens, selectedFilters],
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
    [protocolFilterLabel, selectedFilters],
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
    [isTestnet, networkFilterLabel, selectedFilters],
  )

  return {
    collateralTokenFilter,
    debtTokenFilter,
    depositTokenFilter,
    networkFilter,
    protocolFilter,
  }
}
