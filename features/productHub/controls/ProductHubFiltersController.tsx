import { isTestnetNetworkId } from 'blockchain/networks'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { GenericMultiselect } from 'components/GenericMultiselect'
import { parseQueryString } from 'features/productHub/helpers'
import {
  ALL_ASSETS,
  productHubFiltersCount,
  productHubGridTemplateColumns,
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
import { ProductHubProductType } from 'features/productHub/types'
import { useWalletManagement } from 'features/web3OnBoard'
import type { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { theme } from 'theme'
import { Box } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface ProductHubFiltersControllerProps {
  data: ProductHubItem[]
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  queryString: ProductHubQueryString
  selectedFilters: ProductHubFilters
  selectedProduct: ProductHubProductType
  selectedToken: string
  onChange: (selectedFilters: ProductHubFilters, queryString: ProductHubQueryString) => void
}

export const ProductHubFiltersController: FC<ProductHubFiltersControllerProps> = ({
  data,
  initialNetwork = [],
  initialProtocol = [],
  queryString,
  selectedFilters,
  selectedProduct,
  selectedToken,
  onChange,
}) => {
  const { t } = useTranslation()
  const { chainId } = useWalletManagement()
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)
  const isTestnet = isTestnetNetworkId(chainId)

  const debtTokens = useMemo(
    () =>
      uniq(data.map((item) => item.secondaryToken))
        .map((item) => ({
          label: item,
          value: item,
          token: item,
        }))
        .sort((a, b) => (a.value > b.value ? 1 : -1)),
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
      ).map((item) => ({
        label: item,
        value: item,
        token: item,
      })),
    [data, selectedToken],
  )

  return (
    <AssetsFiltersContainer
      key={`${selectedProduct}-${selectedToken}`}
      gridTemplateColumns={[
        '100%',
        null,
        `repeat(${productHubFiltersCount[selectedProduct]}, 1fr)`,
        productHubGridTemplateColumns[selectedProduct],
      ]}
    >
      {selectedProduct === ProductHubProductType.Borrow && (
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
      )}
      {selectedProduct === ProductHubProductType.Multiply && (
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
      )}
      {!isSmallerScreen && <Box />}
      {selectedProduct === ProductHubProductType.Multiply && (
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
      )}
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
    </AssetsFiltersContainer>
  )
}
