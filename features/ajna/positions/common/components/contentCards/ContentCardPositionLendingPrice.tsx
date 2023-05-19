import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import {  Card, Heading, Text } from 'theme-ui'

interface ContentCardPositionLendingPriceModalProps {
  positionLendingPrice: string
  highestThresholdPrice: string
  collateralToken: string
  quoteToken: string
}

function ContentCardPositionLendingPriceModal({
  positionLendingPrice,
  highestThresholdPrice,
  collateralToken,
  quoteToken,
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
        {positionLendingPrice} {quoteToken}
      </Card>
      <Heading variant="header5" sx={{ fontWeight: 'bold' }}>
        {t('ajna.position-page.earn.manage.overview.minimum-yield-price-modal')}
      </Heading>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.position-page.earn.manage.overview.minimum-yield-price-modal-desc', {
          quoteToken,
        })}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
        {highestThresholdPrice} {collateralToken}/{quoteToken}
      </Card>
    </>
  )
}

interface ContentCardPositionLendingPriceProps {
  isLoading?: boolean
  collateralToken: string
  quoteToken: string
  positionLendingPrice: BigNumber
  highestThresholdPrice: BigNumber
  afterPositionLendingPrice?: BigNumber
  relationToMarketPrice: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardPositionLendingPrice({
  isLoading,
  collateralToken,
  quoteToken,
  positionLendingPrice,
  highestThresholdPrice,
  afterPositionLendingPrice,
  relationToMarketPrice,
  changeVariant = 'positive',
}: ContentCardPositionLendingPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    positionLendingPrice: formatCryptoBalance(positionLendingPrice),
    afterPositionLendingPrice:
      afterPositionLendingPrice && formatCryptoBalance(afterPositionLendingPrice),
    highestThresholdPrice: formatCryptoBalance(highestThresholdPrice),
    relationToMarketPrice: t(
      relationToMarketPrice.gte(zero)
        ? 'ajna.position-page.earn.manage.overview.above-market-price'
        : 'ajna.position-page.earn.manage.overview.below-market-price',
      { amount: formatDecimalAsPercent(relationToMarketPrice.abs()) },
    ),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.position-lending-price'),
    value: formatted.positionLendingPrice,
    unit: `${collateralToken}/${quoteToken}`,
    change: {
      isLoading,
      value:
        afterPositionLendingPrice &&
        `${formatted.afterPositionLendingPrice} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    footnote: formatted.relationToMarketPrice,
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.position-lending-price')}
      >
        <ContentCardPositionLendingPriceModal
          positionLendingPrice={formatted.positionLendingPrice}
          highestThresholdPrice={formatted.highestThresholdPrice}
          collateralToken={collateralToken}
          quoteToken={quoteToken}
        />
      </AjnaDetailsSectionContentSimpleModal>
    ),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
