import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface ContentCardPositionLendingPriceModalProps {
  positionLendingPrice: string
  highestThresholdPrice: string
  priceFormat: string
  quoteToken: string
  isShort: boolean
}

function ContentCardPositionLendingPriceModal({
  positionLendingPrice,
  highestThresholdPrice,
  priceFormat,
  quoteToken,
  isShort,
}: ContentCardPositionLendingPriceModalProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.position-page.earn.manage.overview.position-lending-price-modal-desc', {
          quoteToken,
        })}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {positionLendingPrice} {priceFormat}
      </Card>
      <Heading variant="header5" sx={{ fontWeight: 'bold' }}>
        {t(
          `ajna.position-page.earn.manage.overview.${
            isShort ? 'maximum' : 'minimum'
          }-yield-price-modal`,
        )}
      </Heading>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t(
          `ajna.position-page.earn.manage.overview.${
            isShort ? 'maximum' : 'minimum'
          }-yield-price-modal-desc`,
          {
            quoteToken,
          },
        )}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
        {highestThresholdPrice} {priceFormat}
      </Card>
    </>
  )
}

interface ContentCardPositionLendingPriceProps {
  isLoading?: boolean
  quoteToken: string
  priceFormat: string
  isShort?: boolean
  positionLendingPrice: BigNumber
  highestThresholdPrice: BigNumber
  afterPositionLendingPrice?: BigNumber
  relationToMarketPrice: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardPositionLendingPrice({
  isLoading,
  quoteToken,
  priceFormat,
  isShort = false,
  positionLendingPrice,
  highestThresholdPrice,
  afterPositionLendingPrice,
  relationToMarketPrice,
  changeVariant = 'positive',
}: ContentCardPositionLendingPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    positionLendingPrice: formatCryptoBalance(
      isShort ? one.div(positionLendingPrice) : positionLendingPrice,
    ),
    afterPositionLendingPrice:
      afterPositionLendingPrice &&
      formatCryptoBalance(isShort ? one.div(afterPositionLendingPrice) : afterPositionLendingPrice),
    highestThresholdPrice: formatCryptoBalance(
      isShort ? one.div(highestThresholdPrice) : highestThresholdPrice,
    ),
    relationToMarketPrice: formatDecimalAsPercent(relationToMarketPrice.abs()),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.position-lending-price'),
    value: formatted.positionLendingPrice,
    unit: priceFormat,
    change: {
      isLoading,
      value:
        afterPositionLendingPrice &&
        `${formatted.afterPositionLendingPrice} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.position-lending-price')}
      >
        <ContentCardPositionLendingPriceModal
          positionLendingPrice={formatted.positionLendingPrice}
          highestThresholdPrice={formatted.highestThresholdPrice}
          priceFormat={priceFormat}
          quoteToken={quoteToken}
          isShort={isShort}
        />
      </AjnaDetailsSectionContentSimpleModal>
    ),
  }

  if (!positionLendingPrice.isZero()) {
    contentCardSettings.footnote = t(
      `ajna.position-page.earn.manage.overview.${
        relationToMarketPrice.gt(zero) ? 'below' : 'above'
      }-market-price`,
      {
        amount: formatted.relationToMarketPrice,
      },
    )
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
