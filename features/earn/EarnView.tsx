import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ProductCardEarn } from '../../components/ProductCardEarn'
import { ProductCardsWrapper } from '../../components/ProductCardsWrapper'
import { ProductHeader } from '../../components/ProductHeader'
import { AppSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import { earnPageCardsData } from '../../helpers/productCards'

export function EarnView() {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const [productCardsData, productCardsDataError] = useObservable(productCardsData$)

  return (
    <Grid
      sx={{
        flex: 1,
        position: 'relative',
        mb: ['123px', '187px'],
      }}
    >
      <ProductHeader
        title={t('product-page.earn.title')}
        description={t('product-page.earn.description')}
        link={{
          href: 'https://kb.oasis.app/help/earn-with-dai-and-g-uni-multiply',
          text: t('product-page.earn.link'),
        }}
      />

      <WithErrorHandler error={[productCardsDataError]}>
        <WithLoadingIndicator
          value={[productCardsData]}
          customLoader={
            <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
              <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
            </Flex>
          }
        >
          {([productCardsData]) => (
            <ProductCardsWrapper>
              {earnPageCardsData({ productCardsData }).map((cardData) => (
                <ProductCardEarn cardData={cardData} key={cardData.ilk} />
              ))}
            </ProductCardsWrapper>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
