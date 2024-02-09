import { isTestnetNetworkId, NetworkIds } from 'blockchain/networks'
import { GenericMultiselect } from 'components/GenericMultiselect'
import { Toggle } from 'components/Toggle'
import { parseQueryString } from 'features/productHub/helpers'
import {
  ALL_ASSETS,
  productHubNetworkFilter,
  productHubProtocolFilter,
  productHubStrategyFilter,
  productHubTestNetworkFilter,
} from 'features/productHub/meta'
import type {
  ProductHubFilters,
  ProductHubItem,
  ProductHubMultiplyStrategyType,
  ProductHubQueryString,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'theme-ui'

export interface ProductHubFiltersParams {
  data: ProductHubItem[]
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  networkId?: NetworkIds
  onChange: (selectedFilters: ProductHubFilters, queryString: ProductHubQueryString) => void
  queryString: ProductHubQueryString
  selectedFilters: ProductHubFilters
  selectedToken: string
}

export const useProductHubFilters = ({
  data,
  initialNetwork,
  initialProtocol,
  networkId,
  onChange,
  queryString,
  selectedFilters,
  selectedToken,
}: ProductHubFiltersParams) => {
  const { t } = useTranslation()

  const isTestnet = isTestnetNetworkId(networkId ?? NetworkIds.MAINNET)
  const debtTokens = useMemo(
    () =>
      uniq(data.map((item) => item.secondaryToken))
        .sort()
        .map((item) => ({
          label: item,
          value: item,
          token: item,
        })),
    [data],
  )
  const secondaryTokens = useMemo(
    () =>
      uniq(
        data.flatMap((item) => [
          ...([ALL_ASSETS, item.primaryToken, item.primaryTokenGroup].includes(selectedToken)
            ? [item.secondaryToken]
            : []),
          ...([ALL_ASSETS, item.secondaryToken, item.secondaryTokenGroup].includes(selectedToken)
            ? [item.primaryToken]
            : []),
        ]),
      )
        .sort()
        .map((item) => ({
          label: item,
          value: item,
          token: item,
        })),
    [data, selectedToken],
  )

  const debtTokenFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={queryString.debtToken}
        label={t('product-hub.filters.debt-tokens')}
        options={debtTokens}
        onChange={(value) => {
          onChange(
            {
              or: selectedFilters.or,
              and: { ...selectedFilters.and, secondaryToken: value },
            },
            parseQueryString({
              key: 'debtToken',
              maxLength: debtTokens.length,
              queryString,
              value,
            }),
          )
        }}
      />
    ),
    [debtTokens, queryString, selectedFilters],
  )
  const secondaryTokenFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={queryString.secondaryToken}
        label={t('product-hub.filters.secondary-tokens')}
        options={secondaryTokens}
        onChange={(value) => {
          onChange(
            {
              or:
                selectedToken === ALL_ASSETS
                  ? [{ primaryToken: value }, { secondaryToken: value }]
                  : [
                      { primaryTokenGroup: [selectedToken], secondaryToken: value },
                      { primaryToken: [selectedToken], secondaryToken: value },
                      { primaryToken: value, secondaryToken: [selectedToken] },
                      { primaryToken: value, secondaryTokenGroup: [selectedToken] },
                    ],
              and: selectedFilters.and,
            },
            parseQueryString({
              key: 'secondaryToken',
              maxLength: secondaryTokens.length,
              queryString,
              value,
            }),
          )
        }}
      />
    ),
    [queryString, secondaryTokens, selectedFilters, selectedToken],
  )
  const multiplyStrategyFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={queryString.strategy}
        label={t('product-hub.filters.strategies')}
        options={productHubStrategyFilter}
        onChange={(value) => {
          const multiplyStrategyType = value as ProductHubMultiplyStrategyType[]

          onChange(
            {
              or: selectedFilters.or,
              and: {
                ...selectedFilters.and,
                multiplyStrategyType,
              },
            },
            parseQueryString({
              key: 'strategy',
              maxLength: productHubStrategyFilter.length,
              queryString,
              value: multiplyStrategyType,
            }),
          )
        }}
      />
    ),
    [queryString, selectedFilters],
  )
  const networkFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={queryString.network || initialNetwork}
        label={t('product-hub.filters.networks')}
        options={isTestnet ? productHubTestNetworkFilter : productHubNetworkFilter}
        onChange={(value) => {
          const network = value as ProductHubSupportedNetworks[]

          onChange(
            {
              or: selectedFilters.or,
              and: {
                ...selectedFilters.and,
                network,
              },
            },
            parseQueryString({
              key: 'network',
              maxLength: (isTestnet ? productHubTestNetworkFilter : productHubNetworkFilter).length,
              queryString,
              value: network,
            }),
          )
        }}
      />
    ),
    [initialNetwork, isTestnet, queryString, selectedFilters],
  )
  const protocolFilter = useMemo(
    () => (
      <GenericMultiselect
        initialValues={queryString.protocol || initialProtocol}
        label={t('product-hub.filters.protocols')}
        options={productHubProtocolFilter}
        onChange={(value) => {
          const protocol = value as LendingProtocol[]

          onChange(
            {
              or: selectedFilters.or,
              and: {
                ...selectedFilters.and,
                protocol,
              },
            },
            parseQueryString({
              key: 'protocol',
              maxLength: productHubProtocolFilter.length,
              queryString,
              value: protocol,
            }),
          )
        }}
      />
    ),
    [initialProtocol, queryString, selectedFilters],
  )
  const rewardsFilter = useMemo(
    () => (
      <Flex sx={{ columnGap: 2 }}>
        <Text variant="boldParagraph3">Rewards only</Text>
        <Toggle
          isChecked={queryString.rewardsOnly?.[0] ?? false}
          onChange={(checked) => {
            delete selectedFilters.and.hasRewards

            onChange(
              {
                or: selectedFilters.or,
                and: {
                  ...selectedFilters.and,
                  ...(checked && { hasRewards: [true] }),
                },
              },
              parseQueryString({
                key: 'rewardsOnly',
                maxLength: 2,
                queryString,
                value: [checked],
              }),
            )
          }}
        />
      </Flex>
    ),
    [initialProtocol, queryString, selectedFilters],
  )

  return {
    debtTokenFilter,
    multiplyStrategyFilter,
    networkFilter,
    protocolFilter,
    rewardsFilter,
    secondaryTokenFilter,
  }
}
