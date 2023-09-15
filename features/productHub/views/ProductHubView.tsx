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
import { getAppConfig } from 'helpers/config'
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
  const { AjnaSafetySwitch } = getAppConfig('features')
  const { data } = useProductHubData({
    protocols: [
      !AjnaSafetySwitch && LendingProtocol.Ajna,
      LendingProtocol.AaveV2,
      LendingProtocol.AaveV3,
      LendingProtocol.Maker,
      LendingProtocol.SparkV3,
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
