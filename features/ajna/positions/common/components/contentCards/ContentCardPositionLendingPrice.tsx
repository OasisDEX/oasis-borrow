import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { Steps } from 'components/Steps'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
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
  priceColor: string
  priceColorIndex: number
  withTooltips?: boolean
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
  priceColor,
  priceColorIndex,
  withTooltips,
  changeVariant = 'positive',
}: ContentCardPositionLendingPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    positionLendingPrice: formatCryptoBalance(
      isShort ? normalizeValue(one.div(positionLendingPrice)) : positionLendingPrice,
    ),
    afterPositionLendingPrice:
      afterPositionLendingPrice &&
      formatCryptoBalance(isShort ? one.div(afterPositionLendingPrice) : afterPositionLendingPrice),
    highestThresholdPrice: formatCryptoBalance(
      isShort ? one.div(highestThresholdPrice) : highestThresholdPrice,
    ),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.position-lending-price'),
    value: formatted.positionLendingPrice,
    unit: priceFormat,
    customValueColor: priceColor,
    extra: !isLoading && !afterPositionLendingPrice && (
      <Steps active={priceColorIndex} color={priceColor} count={4} />
    ),
    change: {
      isLoading,
      value: afterPositionLendingPrice && [
        '',
        `${formatted.afterPositionLendingPrice}`,
        `${priceFormat} ${t('system.cards.common.after')}`,
      ],
      ...(withTooltips &&
        afterPositionLendingPrice &&
        !afterPositionLendingPrice.isZero() && {
          tooltip: `${afterPositionLendingPrice.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`,
        }),
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

  if (withTooltips && !positionLendingPrice.isZero()) {
    contentCardSettings.valueTooltip = `${positionLendingPrice.dp(
      DEFAULT_TOKEN_DIGITS,
    )} ${priceFormat}`
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
