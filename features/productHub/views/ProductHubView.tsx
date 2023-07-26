import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { ProductHubLoadingState } from 'features/productHub/components'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import {
  ProductHubNaturalLanguageSelectorController,
  ProductHubPromoCardsController,
} from 'features/productHub/controls'
import { ProductHubContentController } from 'features/productHub/controls/ProductHubContentController'
import { useProductHubData } from 'features/productHub/hooks/useProductHubData'
import { ALL_ASSETS } from 'features/productHub/meta'
import {
  ProductHubFilters,
  ProductHubProductType,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { PromoCardsCollection } from 'handlers/product-hub/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React, { FC, Fragment, ReactNode, useMemo, useState } from 'react'
import { Box, Flex } from 'theme-ui'

interface ProductHubViewProps {
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  intro?: (selectedProduct: ProductHubProductType, selectedToken: string) => ReactNode
  headerGradient?: [string, string, ...string[]]
  product: ProductHubProductType
  promoCardsCollection: PromoCardsCollection
  token?: string
  url?: string
  limitRows?: number
}

export const ProductHubView: FC<ProductHubViewProps> = ({
  initialNetwork,
  initialProtocol,
  headerGradient = ['#007DA3', '#E7A77F', '#E97047'],
  product,
  promoCardsCollection,
  intro,
  token,
  url,
  limitRows,
}) => {
  const { t } = useTranslation()
  const { data } = useProductHubData({
    protocols: [
      LendingProtocol.Ajna,
      LendingProtocol.AaveV2,
      LendingProtocol.AaveV3,
      LendingProtocol.Maker,
    ],
    promoCardsCollection,
  })
  const defaultFilters = useMemo(
    () => ({
      or: [],
      and: {
        ...(initialNetwork && { network: initialNetwork }),
        ...(initialProtocol && { protocol: initialProtocol }),
      },
    }),
    [initialNetwork, initialProtocol],
  )
  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(product)
  const [selectedToken, setSelectedToken] = useState<string>(token || ALL_ASSETS)
  const [selectedFilters, setSelectedFilters] = useState<ProductHubFilters>(defaultFilters)

  // TODO: remove when Ajna Multiply feature flag is no longer needed
  const ajnaMultiplyEnabled = useFeatureToggle('AjnaMultiply')

  const filteredData = useMemo(() => {
    return !data
      ? undefined
      : ajnaMultiplyEnabled
      ? data
      : {
          promoCards: {
            borrow: data.promoCards.borrow,
            multiply: {
              default: data.promoCards.multiply.default.filter(
                (card) =>
                  !(
                    card.protocol?.protocol === LendingProtocol.Ajna &&
                    card.link?.href.includes('multiply')
                  ),
              ),
              tokens: Object.keys(data.promoCards.multiply.tokens).reduce(
                (total, current) => ({
                  ...total,
                  [current]: data.promoCards.multiply.tokens[current].filter(
                    (card) =>
                      !(
                        card.protocol?.protocol === LendingProtocol.Ajna &&
                        card.link?.href.includes('multiply')
                      ),
                  ),
                }),
                {},
              ),
            },
            earn: data.promoCards.earn,
          },
          table: data.table.map((row) => ({
            ...row,
            ...(row.protocol === LendingProtocol.Ajna && {
              product: row.product.filter((product) => {
                return (
                  product === ProductHubProductType.Borrow ||
                  (product === ProductHubProductType.Earn &&
                    !row.earnStrategy?.includes('Yield Loop'))
                )
              }),
            }),
          })),
        }
  }, [data, ajnaMultiplyEnabled])

  return (
    <Fragment key={product}>
      <Box
        id="product-hub"
        sx={{
          position: 'relative',
          my: [3, null, '48px'],
          scrollMarginTop: '48px',
          textAlign: 'center',
          zIndex: 3,
        }}
      >
        <ProductHubNaturalLanguageSelectorController
          gradient={headerGradient}
          product={product}
          token={token}
          url={url}
          onChange={(_selectedProduct, _selectedToken) => {
            setSelectedProduct(_selectedProduct)
            setSelectedToken(_selectedToken)
            setSelectedFilters(defaultFilters)
          }}
        />
        {intro ? (
          intro(selectedProduct, selectedToken)
        ) : (
          <ProductHubIntro selectedProduct={selectedProduct} selectedToken={selectedToken} />
        )}
      </Box>
      <WithLoadingIndicator value={[filteredData]} customLoader={<ProductHubLoadingState />}>
        {([_data]) => (
          <>
            <ProductHubPromoCardsController
              promoCardsData={_data.promoCards}
              selectedProduct={selectedProduct}
              selectedToken={selectedToken}
            />
            <ProductHubContentController
              initialNetwork={initialNetwork}
              initialProtocol={initialProtocol}
              selectedFilters={selectedFilters}
              selectedProduct={selectedProduct}
              selectedToken={selectedToken}
              tableData={_data.table}
              onChange={setSelectedFilters}
              limitRows={limitRows}
            />
            {limitRows && limitRows > 0 && (
              <Flex
                sx={{
                  justifyContent: 'center',
                  py: 4,
                  borderBottom: '1px solid',
                  borderBottomColor: 'neutral20',
                }}
              >
                <AppLink
                  href={
                    selectedToken === ALL_ASSETS
                      ? `/${selectedProduct}`
                      : `/${selectedProduct}/${selectedToken}`
                  }
                >
                  <WithArrow
                    sx={{ color: 'interactive100', fontWeight: 'regular', fontSize: '16px' }}
                  >
                    {t('view-all')}
                  </WithArrow>
                </AppLink>
              </Flex>
            )}
          </>
        )}
      </WithLoadingIndicator>
    </Fragment>
  )
}
