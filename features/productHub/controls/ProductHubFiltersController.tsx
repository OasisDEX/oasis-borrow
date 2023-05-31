import { BaseNetworkNames } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { GenericMultiselect } from 'components/GenericMultiselect'
import {
  ALL_ASSETS,
  productHubFiltersCount,
  productHubGridTemplateColumns,
  productHubNetworkFilter,
  productHubProtocolFilter,
  productHubStrategyFilter,
} from 'features/productHub/meta'
import {
  ProductHubFilters,
  ProductHubItem,
  ProductHubMultiplyStrategyType,
  ProductHubProductType,
} from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { FC, useMemo } from 'react'
import { theme } from 'theme'
import { Box } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface ProductHubFiltersControllerProps {
  data: ProductHubItem[]
  selectedFilters: ProductHubFilters
  selectedProduct: ProductHubProductType
  selectedToken: string
  onChange: (selectedFilters: ProductHubFilters) => void
}

export const ProductHubFiltersController: FC<ProductHubFiltersControllerProps> = ({
  data,
  selectedFilters,
  selectedProduct,
  selectedToken,
  onChange,
}) => {
  const { t } = useTranslation()
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  const debtTokens = useMemo(
    () =>
      uniq(data.map((item) => item.secondaryToken)).map((item) => ({
        label: item,
        value: item,
        icon: getToken(item).iconCircle,
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
      ).map((item) => ({
        label: item,
        value: item,
        icon: getToken(item).iconCircle,
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
          label={t('product-hub.filters.debt-tokens')}
          options={debtTokens}
          onChange={(value) => {
            onChange({
              or: selectedFilters.or,
              and: { ...selectedFilters.and, secondaryToken: value },
            })
          }}
        />
      )}
      {selectedProduct === ProductHubProductType.Multiply && (
        <GenericMultiselect
          label={t('product-hub.filters.secondary-tokens')}
          options={secondaryTokens}
          onChange={(value) => {
            onChange({
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
            })
          }}
        />
      )}
      {!isSmallerScreen && <Box />}
      {selectedProduct === ProductHubProductType.Multiply && (
        <GenericMultiselect
          label={t('product-hub.filters.strategies')}
          options={productHubStrategyFilter}
          onChange={(value) => {
            onChange({
              or: selectedFilters.or,
              and: {
                ...selectedFilters.and,
                multiplyStrategyType: value as ProductHubMultiplyStrategyType[],
              },
            })
          }}
        />
      )}
      <GenericMultiselect
        label={t('product-hub.filters.networks')}
        options={productHubNetworkFilter}
        onChange={(value) => {
          onChange({
            or: selectedFilters.or,
            and: { ...selectedFilters.and, network: value as unknown as BaseNetworkNames[] },
          })
        }}
      />
      <GenericMultiselect
        label={t('product-hub.filters.protocols')}
        options={productHubProtocolFilter}
        onChange={(value) => {
          onChange({
            or: selectedFilters.or,
            and: { ...selectedFilters.and, protocol: value as LendingProtocol[] },
          })
        }}
      />
    </AssetsFiltersContainer>
  )
}
