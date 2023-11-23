import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { Steps } from 'components/Steps'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface OmniContentCardPositionLendingPriceModalProps {
  positionLendingPrice: string
  highestThresholdPrice: string
  priceFormat: string
  quoteToken: string
  isShort: boolean
}

function OmniContentCardPositionLendingPriceModal({
  positionLendingPrice,
  highestThresholdPrice,
  priceFormat,
  quoteToken,
  isShort,
}: OmniContentCardPositionLendingPriceModalProps) {
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

interface OmniContentCardPositionLendingPriceProps {
  isLoading?: boolean
  quoteToken: string
  priceFormat: string
  positionLendingPrice: BigNumber
  highestThresholdPrice: BigNumber
  afterPositionLendingPrice?: BigNumber
  isShort: boolean
  priceColor: string
  priceColorIndex: number
  steps: number
  withTooltips?: boolean
  changeVariant?: ChangeVariantType
}

export function OmniContentCardPositionLendingPrice({
  isLoading,
  quoteToken,
  priceFormat,
  positionLendingPrice,
  highestThresholdPrice,
  afterPositionLendingPrice,
  isShort,
  priceColor,
  priceColorIndex,
  steps,
  withTooltips,
  changeVariant = 'positive',
}: OmniContentCardPositionLendingPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    positionLendingPrice: formatCryptoBalance(positionLendingPrice),
    afterPositionLendingPrice:
      afterPositionLendingPrice && formatCryptoBalance(afterPositionLendingPrice),
    highestThresholdPrice: formatCryptoBalance(highestThresholdPrice),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.position-lending-price'),
    value: formatted.positionLendingPrice,
    unit: priceFormat,
    customValueColor: priceColor,
    extra: !isLoading && !afterPositionLendingPrice && (
      <Steps active={priceColorIndex} color={priceColor} count={steps} />
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
        <OmniContentCardPositionLendingPriceModal
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
