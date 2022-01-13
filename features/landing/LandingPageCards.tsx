import { useTranslation } from 'next-i18next'
import React from 'react'

import { IlkDataList } from '../../blockchain/ilks'
import { getToken } from '../../blockchain/tokensMetadata'
import { ProductCard } from '../../components/ProductCard'
import { borrowPageCards, landingPageCards, multiplyPageCards } from '../../helpers/productCards'
import { formatPercent } from '../../helpers/formatters/format'
import { one } from '../../helpers/zero'
import { Flex, Heading } from 'theme-ui'
import { BigNumber } from 'bignumber.js'

interface LandingPageCardsProps {
  ilkDataList: IlkDataList
}

export function LandingPageCards({ ilkDataList }: LandingPageCardsProps) {
  const { t } = useTranslation()

  return (
    <Flex sx={{ flexDirection: 'column', width: '100%' }}>
      <Heading sx={{ pb: 3, textAlign: 'center' }}>Landing page multiply</Heading>
      <Flex sx={{ justifyContent: 'space-around', pb: 4 }}>
        {landingPageCards(ilkDataList, 'multiply').map((ilk) => {
          const tokenMeta = getToken(ilk.token)

          const maxMultiple = one.div(ilk.liquidationRatio.minus(one))

          return (
            <ProductCard
              tokenImage={tokenMeta.bannerIcon}
              title={ilk.ilk}
              description={t(`product-card.multiply.description`, { token: ilk.token })}
              banner={{
                title: t('product-card-banner.with', { value: '100', token: ilk.token }),
                description: t(`product-card-banner.multiply.description`, {
                  value: maxMultiple.times(100).toFixed(2),
                  token: ilk.token,
                }),
              }}
              leftSlot={{
                title: t('system.max-multiple'),
                value: `${maxMultiple.toFixed(2)}x`,
              }}
              rightSlot={{
                title: t(t('system.stability-fee')),
                value: formatPercent(ilk.stabilityFee.times(100), { precision: 2 }),
              }}
              button={{ link: `/vaults/open-multiply/${ilk.ilk}`, text: t('nav.multiply') }}
              background={tokenMeta.background!}
            />
          )
        })}
      </Flex>
      <Heading sx={{ pb: 3, textAlign: 'center' }}>Landing page borrow</Heading>
      <Flex sx={{ justifyContent: 'space-around', pb: 4 }}>
        {landingPageCards(ilkDataList, 'borrow').map((ilk) => {
          const tokenMeta = getToken(ilk.token)

          const maxMultiple = one.div(ilk.liquidationRatio.minus(one))
          const maxBorrowAmount = new BigNumber(one.div(ilk.liquidationRatio).multipliedBy(100000)).toFixed(0)
          return (
            <ProductCard
              tokenImage={tokenMeta.bannerIcon}
              title={ilk.ilk}
              description={t(`product-card.borrow.description`, { token: ilk.token })}
              banner={{
                title: t('product-card-banner.with', { value: '100', token: ilk.token }),
                description: t(`product-card-banner.borrow.description`, {
                  value: maxBorrowAmount,
                }),
              }}
              leftSlot={{
                title: t('system.min-coll-ratio'),
                value: `${formatPercent(ilk.liquidationRatio.times(100), { precision: 2 })}`,
              }}
              rightSlot={{
                title: t(t('system.stability-fee')),
                value: formatPercent(ilk.stabilityFee.times(100), { precision: 2 }),
              }}
              button={{ link: `/vaults/open/${ilk.ilk}`, text: t('nav.borrow') }}
              background={tokenMeta.background!}
            />
          )
        })}
      </Flex>
      <Heading sx={{ pb: 3, textAlign: 'center' }}>Landing page earn</Heading>
      <Flex sx={{ justifyContent: 'space-around', pb: 4 }}>
        {landingPageCards(ilkDataList, 'earn').map((ilk) => {
          const tokenMeta = getToken(ilk.token)

          const maxMultiple = one.div(ilk.liquidationRatio.minus(one))

          return (
            <ProductCard
              tokenImage={tokenMeta.bannerIcon}
              title={tokenMeta.name}
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
                value: formatPercent(ilk.stabilityFee.times(100), { precision: 2 }),
              }}
              button={{ link: `/vaults/open-multiply/${ilk.ilk}`, text: t('nav.earn') }}
              background={tokenMeta.background!}
            />
          )
        })}
      </Flex>
      <Heading sx={{ pb: 3, textAlign: 'center' }}>Multiply page featured</Heading>
      <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
        {multiplyPageCards({ ilkDataList }).map((ilk) => {
          const tokenMeta = getToken(ilk.token)

          const maxMultiple = one.div(ilk.liquidationRatio.minus(one))

          return (
            <ProductCard
              tokenImage={tokenMeta.bannerIcon}
              title={ilk.ilk}
              description={t(`product-card.multiply.description`, { token: ilk.token })}
              banner={{
                title: t('product-card-banner.with', { value: '100', token: ilk.token }),
                description: t(`product-card-banner.multiply.description`, {
                  value: maxMultiple.times(100).toFixed(2),
                  token: ilk.token,
                }),
              }}
              leftSlot={{
                title: t('system.max-multiple'),
                value: `${maxMultiple.toFixed(2)}x`,
              }}
              rightSlot={{
                title: t(t('system.stability-fee')),
                value: formatPercent(ilk.stabilityFee.times(100), { precision: 2 }),
              }}
              button={{ link: `/vaults/open-multiply/${ilk.ilk}`, text: t('nav.multiply') }}
              background={tokenMeta.background!}
            />
          )
        })}
      </Flex>
      <Heading sx={{ pb: 3, textAlign: 'center' }}>Multiply page ETH</Heading>
      <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
        {multiplyPageCards({ ilkDataList, token: 'ETH' }).map((ilk) => {
          const tokenMeta = getToken(ilk.token)

          const maxMultiple = one.div(ilk.liquidationRatio.minus(one))

          return (
            <ProductCard
              tokenImage={tokenMeta.bannerIcon}
              title={ilk.ilk}
              description={t(`product-card.multiply.description`, { token: ilk.token })}
              banner={{
                title: t('product-card-banner.with', { value: '100', token: ilk.token }),
                description: t(`product-card-banner.multiply.description`, {
                  value: maxMultiple.times(100).toFixed(2),
                  token: ilk.token,
                }),
              }}
              leftSlot={{
                title: t('system.max-multiple'),
                value: `${maxMultiple.toFixed(2)}x`,
              }}
              rightSlot={{
                title: t(t('system.stability-fee')),
                value: formatPercent(ilk.stabilityFee.times(100), { precision: 2 }),
              }}
              button={{ link: `/vaults/open-multiply/${ilk.ilk}`, text: t('nav.multiply') }}
              background={tokenMeta.background!}
            />
          )
        })}
      </Flex>
      <Heading sx={{ pb: 3, textAlign: 'center' }}>Borrow page featured</Heading>
      <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
        {borrowPageCards({ ilkDataList }).map((ilk) => {
          const tokenMeta = getToken(ilk.token)

          const maxMultiple = one.div(ilk.liquidationRatio.minus(one))

          return (
            <ProductCard
              tokenImage={tokenMeta.bannerIcon}
              title={ilk.ilk}
              description={t(`product-card.borrow.description`, { token: ilk.token })}
              banner={{
                title: t('product-card-banner.with', { value: '100', token: ilk.token }),
                description: t(`product-card-banner.borrow.description`, {
                  value: maxMultiple.times(100).toFixed(2),
                }),
              }}
              leftSlot={{
                title: t('system.min-coll-ratio'),
                value: `${formatPercent(ilk.liquidationRatio.times(100), { precision: 2 })}`,
              }}
              rightSlot={{
                title: t(t('system.stability-fee')),
                value: formatPercent(ilk.stabilityFee.times(100), { precision: 2 }),
              }}
              button={{ link: `/vaults/open/${ilk.ilk}`, text: t('nav.borrow') }}
              background={tokenMeta.background!}
            />
          )
        })}
      </Flex>
      <Heading sx={{ pb: 3, textAlign: 'center' }}>Borrow page BTC</Heading>
      <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
        {borrowPageCards({ ilkDataList, token: 'WBTC' }).map((ilk) => {
          const tokenMeta = getToken(ilk.token)

          const maxMultiple = one.div(ilk.liquidationRatio.minus(one))

          return (
            <ProductCard
              tokenImage={tokenMeta.bannerIcon}
              title={ilk.ilk}
              description={t(`product-card.borrow.description`, { token: ilk.token })}
              banner={{
                title: t('product-card-banner.with', { value: '100', token: ilk.token }),
                description: t(`product-card-banner.borrow.description`, {
                  value: maxMultiple.times(100).toFixed(2),
                }),
              }}
              leftSlot={{
                title: t('system.min-coll-ratio'),
                value: `${formatPercent(ilk.liquidationRatio.times(100), { precision: 2 })}`,
              }}
              rightSlot={{
                title: t(t('system.stability-fee')),
                value: formatPercent(ilk.stabilityFee.times(100), { precision: 2 }),
              }}
              button={{ link: `/vaults/open/${ilk.ilk}`, text: t('nav.borrow') }}
              background={tokenMeta.background!}
            />
          )
        })}
      </Flex>
      <Heading sx={{ pb: 3, textAlign: 'center' }}>Borrow page UNI-LP</Heading>
      <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
        {borrowPageCards({ ilkDataList, token: 'UNI-LP' }).map((ilk) => {
          const tokenMeta = getToken(ilk.token)

          const maxMultiple = one.div(ilk.liquidationRatio.minus(one))

          return (
            <ProductCard
              tokenImage={tokenMeta.bannerIcon}
              title={ilk.ilk}
              description={t(`product-card.borrow.description`, { token: ilk.token })}
              banner={{
                title: t('product-card-banner.with', { value: '100', token: ilk.token }),
                description: t(`product-card-banner.borrow.description`, {
                  value: maxMultiple.times(100).toFixed(2),
                }),
              }}
              leftSlot={{
                title: t('system.min-coll-ratio'),
                value: `${formatPercent(ilk.liquidationRatio.times(100), { precision: 2 })}`,
              }}
              rightSlot={{
                title: t(t('system.stability-fee')),
                value: formatPercent(ilk.stabilityFee.times(100), { precision: 2 }),
              }}
              button={{ link: `/vaults/open/${ilk.ilk}`, text: t('nav.borrow') }}
              background={tokenMeta.background!}
            />
          )
        })}
      </Flex>
      <Heading sx={{ pb: 3, textAlign: 'center' }}>Borrow page UNI</Heading>
      <Flex sx={{ justifyContent: 'space-around', pb: 4, flexWrap: 'wrap' }}>
        {borrowPageCards({ ilkDataList, token: 'UNI' }).map((ilk) => {
          const tokenMeta = getToken(ilk.token)

          const maxMultiple = one.div(ilk.liquidationRatio.minus(one))

          return (
            <ProductCard
              tokenImage={tokenMeta.bannerIcon}
              title={ilk.ilk}
              description={t(`product-card.borrow.description`, { token: ilk.token })}
              banner={{
                title: t('product-card-banner.with', { value: '100', token: ilk.token }),
                description: t(`product-card-banner.borrow.description`, {
                  value: maxMultiple.times(100).toFixed(2),
                }),
              }}
              leftSlot={{
                title: t('system.min-coll-ratio'),
                value: `${formatPercent(ilk.liquidationRatio.times(100), { precision: 2 })}`,
              }}
              rightSlot={{
                title: t(t('system.stability-fee')),
                value: formatPercent(ilk.stabilityFee.times(100), { precision: 2 }),
              }}
              button={{ link: `/vaults/open/${ilk.ilk}`, text: t('nav.borrow') }}
              background={tokenMeta.background!}
            />
          )
        })}
      </Flex>
    </Flex>
  )
}
