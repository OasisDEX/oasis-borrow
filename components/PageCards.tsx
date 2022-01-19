import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Heading } from 'theme-ui'

import { AppSpinner, WithLoadingIndicator } from '../helpers/AppSpinner'
import { WithErrorHandler } from '../helpers/errorHandlers/WithErrorHandler'
import { formatPercent } from '../helpers/formatters/format'
import { useObservableWithError } from '../helpers/observableHook'
import {
  borrowPageCardsData,
  landingPageCardsData,
  multiplyPageCardsData,
} from '../helpers/productCards'
import { one } from '../helpers/zero'
import { useAppContext } from './AppContextProvider'
import { ProductCard } from './ProductCard'

const hardcodedTokenAmount = 1

// TODO THIS IS DUMMY COMPONENT WHICH SHOULD REMOVED WHEN ALL PAGES WILL BE AVAILABLE
export function PageCards() {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const { error: productCardsDataError, value: productCardsDataValue } = useObservableWithError(
    productCardsData$,
  )

  return (
    <WithErrorHandler error={[productCardsDataError]}>
      <WithLoadingIndicator
        value={[productCardsDataValue]}
        customLoader={
          <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
            <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
          </Flex>
        }
      >
        {([productCardsData]) => {
          return (
            <Flex sx={{ flexDirection: 'column', width: '100%' }}>
              <Heading sx={{ pb: 3, textAlign: 'center' }}>Landing page multiply</Heading>
              <Flex sx={{ justifyContent: 'space-around', pb: 4 }}>
                {landingPageCardsData({ productCardsData }).map((cardData) => {
                  const maxMultiple = one.div(cardData.liquidationRatio.minus(one))

                  return (
                    <ProductCard
                      key={cardData.ilk}
                      tokenImage={cardData.bannerIcon}
                      title={cardData.ilk}
                      description={t(`product-card.multiply.description`, {
                        token: cardData.token,
                      })}
                      banner={{
                        title: t('product-card-banner.with', {
                          value: '100',
                          token: cardData.token,
                        }),
                        description: t(`product-card-banner.multiply.description`, {
                          value: maxMultiple.times(100).toFixed(2),
                          token: cardData.token,
                        }),
                      }}
                      leftSlot={{
                        title: t('system.max-multiple'),
                        value: `${maxMultiple.toFixed(2)}x`,
                      }}
                      rightSlot={{
                        title: t(t('system.stability-fee')),
                        value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
                      }}
                      button={{
                        link: `/vaults/open-multiply/${cardData.ilk}`,
                        text: t('nav.multiply'),
                      }}
                      background={cardData.background}
                    />
                  )
                })}
              </Flex>
              <Heading sx={{ pb: 3, textAlign: 'center' }}>Landing page borrow</Heading>
              <Flex sx={{ justifyContent: 'space-around', pb: 4 }}>
                {landingPageCardsData({ productCardsData, product: 'borrow' }).map((cardData) => {
                  const maxBorrowAmount = new BigNumber(
                    one
                      .div(cardData.liquidationRatio)
                      .multipliedBy(cardData.currentCollateralPrice.times(hardcodedTokenAmount)),
                  ).toFixed(0)

                  return (
                    <ProductCard
                      key={cardData.ilk}
                      tokenImage={cardData.bannerIcon}
                      title={cardData.ilk}
                      description={t(`product-card.borrow.description`, { token: cardData.token })}
                      banner={{
                        title: t('product-card-banner.with', {
                          value: hardcodedTokenAmount,
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
              </Flex>
              <Heading sx={{ pb: 3, textAlign: 'center' }}>Landing page earn</Heading>
              <Flex sx={{ justifyContent: 'space-around', pb: 4 }}>
                {landingPageCardsData({ productCardsData, product: 'earn' }).map((cardData) => {
                  const maxMultiple = one.div(cardData.liquidationRatio.minus(one))

                  return (
                    <ProductCard
                      key={cardData.ilk}
                      tokenImage={cardData.bannerIcon}
                      title={cardData.name}
                      description={t(`product-card.earn.description`, { token: 'DAI' })}
                      banner={{
                        title: t('product-card-banner.with', { value: '100', token: 'DAI' }),
                        description: t(`product-card-banner.earn.description`, {
                          value: maxMultiple.times(100).toFixed(2),
                          token: 'DAI',
                        }),
                      }}
                      leftSlot={{
                        title: t('system.max-multiple'),
                        value: `${maxMultiple.toFixed(2)}x`,
                      }}
                      rightSlot={{
                        title: t(t('system.stability-fee')),
                        value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
                      }}
                      button={{
                        link: `/vaults/open-multiply/${cardData.ilk}`,
                        text: t('nav.earn'),
                      }}
                      background={cardData.background}
                    />
                  )
                })}
              </Flex>
              <Heading sx={{ pb: 3, textAlign: 'center' }}>Multiply page featured</Heading>
              <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
                {multiplyPageCardsData({ productCardsData }).map((cardData) => {
                  const maxMultiple = one.div(cardData.liquidationRatio.minus(one))

                  return (
                    <ProductCard
                      key={cardData.ilk}
                      tokenImage={cardData.bannerIcon}
                      title={cardData.ilk}
                      description={t(`product-card.multiply.description`, {
                        token: cardData.token,
                      })}
                      banner={{
                        title: t('product-card-banner.with', {
                          value: '100',
                          token: cardData.token,
                        }),
                        description: t(`product-card-banner.multiply.description`, {
                          value: maxMultiple.times(100).toFixed(2),
                          token: cardData.token,
                        }),
                      }}
                      leftSlot={{
                        title: t('system.max-multiple'),
                        value: `${maxMultiple.toFixed(2)}x`,
                      }}
                      rightSlot={{
                        title: t(t('system.stability-fee')),
                        value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
                      }}
                      button={{
                        link: `/vaults/open-multiply/${cardData.ilk}`,
                        text: t('nav.multiply'),
                      }}
                      background={cardData.background}
                    />
                  )
                })}
              </Flex>
              <Heading sx={{ pb: 3, textAlign: 'center' }}>Multiply page ETH</Heading>
              <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
                {multiplyPageCardsData({ productCardsData, cardsFilter: 'ETH' }).map((cardData) => {
                  const maxMultiple = one.div(cardData.liquidationRatio.minus(one))

                  return (
                    <ProductCard
                      key={cardData.ilk}
                      tokenImage={cardData.bannerIcon}
                      title={cardData.ilk}
                      description={t(`product-card.multiply.description`, {
                        token: cardData.token,
                      })}
                      banner={{
                        title: t('product-card-banner.with', {
                          value: '100',
                          token: cardData.token,
                        }),
                        description: t(`product-card-banner.multiply.description`, {
                          value: maxMultiple.times(100).toFixed(2),
                          token: cardData.token,
                        }),
                      }}
                      leftSlot={{
                        title: t('system.max-multiple'),
                        value: `${maxMultiple.toFixed(2)}x`,
                      }}
                      rightSlot={{
                        title: t(t('system.stability-fee')),
                        value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
                      }}
                      button={{
                        link: `/vaults/open-multiply/${cardData.ilk}`,
                        text: t('nav.multiply'),
                      }}
                      background={cardData.background}
                    />
                  )
                })}
              </Flex>
              <Heading sx={{ pb: 3, textAlign: 'center' }}>Borrow page featured</Heading>
              <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
                {borrowPageCardsData({ productCardsData }).map((cardData) => {
                  const maxBorrowAmount = new BigNumber(
                    one
                      .div(cardData.liquidationRatio)
                      .multipliedBy(cardData.currentCollateralPrice.times(hardcodedTokenAmount)),
                  ).toFixed(0)

                  return (
                    <ProductCard
                      key={cardData.ilk}
                      tokenImage={cardData.bannerIcon}
                      title={cardData.ilk}
                      description={t(`product-card.borrow.description`, { token: cardData.token })}
                      banner={{
                        title: t('product-card-banner.with', {
                          value: hardcodedTokenAmount,
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
              </Flex>
              <Heading sx={{ pb: 3, textAlign: 'center' }}>Borrow page BTC</Heading>
              <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
                {borrowPageCardsData({ productCardsData, cardsFilter: 'BTC' }).map((cardData) => {
                  const maxBorrowAmount = new BigNumber(
                    one
                      .div(cardData.liquidationRatio)
                      .multipliedBy(cardData.currentCollateralPrice.times(hardcodedTokenAmount)),
                  ).toFixed(0)

                  return (
                    <ProductCard
                      key={cardData.ilk}
                      tokenImage={cardData.bannerIcon}
                      title={cardData.ilk}
                      description={t(`product-card.borrow.description`, { token: cardData.token })}
                      banner={{
                        title: t('product-card-banner.with', {
                          value: hardcodedTokenAmount,
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
              </Flex>
              <Heading sx={{ pb: 3, textAlign: 'center' }}>Borrow page UNI-LP</Heading>
              <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
                {borrowPageCardsData({ productCardsData, cardsFilter: 'UNI LP' }).map(
                  (cardData) => {
                    const maxBorrowAmount = new BigNumber(
                      one
                        .div(cardData.liquidationRatio)
                        .multipliedBy(cardData.currentCollateralPrice.times(hardcodedTokenAmount)),
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
                            value: hardcodedTokenAmount,
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
                  },
                )}
              </Flex>
              <Heading sx={{ pb: 3, textAlign: 'center' }}>Borrow page UNI</Heading>
              <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
                {borrowPageCardsData({ productCardsData, cardsFilter: 'UNI' }).map((cardData) => {
                  const maxBorrowAmount = new BigNumber(
                    one
                      .div(cardData.liquidationRatio)
                      .multipliedBy(cardData.currentCollateralPrice.times(hardcodedTokenAmount)),
                  ).toFixed(0)

                  return (
                    <ProductCard
                      key={cardData.ilk}
                      tokenImage={cardData.bannerIcon}
                      title={cardData.ilk}
                      description={t(`product-card.borrow.description`, { token: cardData.token })}
                      banner={{
                        title: t('product-card-banner.with', {
                          value: hardcodedTokenAmount,
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
              </Flex>
            </Flex>
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
