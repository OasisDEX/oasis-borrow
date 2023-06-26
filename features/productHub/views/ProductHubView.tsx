import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { ProductHubLoadingState } from 'features/productHub/components'
import {
  ProductHubNaturalLanguageSelectorController,
  ProductHubPromoCardsController,
} from 'features/productHub/controls'
import { ProductHubContentController } from 'features/productHub/controls/ProductHubContentController'
import { useProductHubData } from 'features/productHub/hooks/useProductHubData'
import { ALL_ASSETS, productHubLinksMap } from 'features/productHub/meta'
import {
  ProductHubFilters,
  ProductHubProductType,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { PromoCardsCollection } from 'handlers/product-hub/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React, { FC, Fragment, useMemo, useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'

interface ProductHubViewProps {
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
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

  return (
    <Fragment key={product}>
      <Box
        id="product-hub"
        sx={{
          position: 'relative',
          my: [3, null, '48px'],
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
        <Text
          as="p"
          variant="paragraph2"
          sx={{
            mx: 'auto',
            mt: '24px',
          }}
        >
          {t(`product-hub.intro.${selectedProduct}`)}{' '}
          <AppLink href={productHubLinksMap[selectedProduct]}>
            <WithArrow
              variant="paragraph2"
              sx={{
                display: 'inline-block',
                fontSize: 3,
                color: 'interactive100',
                fontWeight: 'regular',
              }}
            >
              Summer.fi {t(`nav.${selectedProduct}`)}
            </WithArrow>
          </AppLink>
        </Text>
      </Box>
      <WithLoadingIndicator value={[data]} customLoader={<ProductHubLoadingState />}>
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
