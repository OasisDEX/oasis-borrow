import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ProductCard } from '../../components/ProductCard'
import { ProductCardsFilter } from '../../components/ProductCardsFilter'
import { ProductHeader } from '../../components/ProductHeader'
import { AppSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { formatPercent } from '../../helpers/formatters/format'
import { useObservableWithError } from '../../helpers/observableHook'
import { borrowPageCardsData } from '../../helpers/productCards'
import { one } from '../../helpers/zero'

const borrowCardsFilters = [
  { name: 'Featured', icon: 'star_circle' },
  { name: 'ETH', icon: 'eth_circle' },
  { name: 'BTC', icon: 'btc_circle' },
  { name: 'UNI LP', icon: 'uni_lp_circle' },
  { name: 'LINK', icon: 'link_circle' },
  { name: 'UNI', icon: 'uni_circle' },
  { name: 'YFI', icon: 'yfi_circle' },
  { name: 'MANA', icon: 'mana_circle' },
  { name: 'MATIC', icon: 'matic_circle' },
  { name: 'GUSD', icon: 'gusd_circle' },
]

export function BorrowView() {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const { error: productCardsDataError, value: productCardsDataValue } = useObservableWithError(
    productCardsData$,
  )

  return (
    <Grid
      sx={{
        flex: 1,
        position: 'relative',
        mb: ['123px', '343px'],
      }}
    >
      <ProductHeader
        title={t('product-page.borrow.title')}
        description={t('product-page.borrow.description')}
        link={{ href: '', text: t('product-page.borrow.link') }}
      />

      <WithErrorHandler error={[productCardsDataError]}>
        <WithLoadingIndicator
          value={[productCardsDataValue]}
          customLoader={
            <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
              <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
            </Flex>
          }
        >
          {([productCardsData]) => (
            <ProductCardsFilter filters={borrowCardsFilters}>
              {(cardsFilter) => (
                <Grid columns={[1, 2, 3]} sx={{ justifyItems: 'center' }}>
                  {borrowPageCardsData({ productCardsData, cardsFilter }).map((cardData) => {
                    const maxBorrowAmount = new BigNumber(
                      one
                        .div(cardData.liquidationRatio)
                        .multipliedBy(cardData.currentCollateralPrice.times(100)),
                    ).toFixed(0)

                    return (
                      <ProductCard
                        key={cardData.ilk}
                        tokenImage={cardData.bannerIcon}
                        title={cardData.ilk}
                        description={t(`product-card.borrow.description`, {
                          token: cardData.token,
                        })}
                        banner={{
                          title: t('product-card-banner.with', {
                            value: 100,
                            token: cardData.token,
                          }),
                          description: t(`product-card-banner.borrow.description`, {
                            value: maxBorrowAmount,
                          }),
                        }}
                        leftSlot={{
                          title: t('system.min-coll-ratio'),
                          value: `${formatPercent(cardData.liquidationRatio.times(100), {
                            precision: 2,
                          })}`,
                        }}
                        rightSlot={{
                          title: t(t('system.stability-fee')),
                          value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
                        }}
                        button={{ link: `/vaults/open/${cardData.ilk}`, text: t('nav.borrow') }}
                        background={cardData.background}
                      />
                    )
                  })}
                </Grid>
              )}
            </ProductCardsFilter>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
