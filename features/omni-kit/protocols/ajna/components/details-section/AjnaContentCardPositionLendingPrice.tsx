import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { Steps } from 'components/Steps'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface AjnaContentCardPositionLendingPriceModalProps {
  positionLendingPrice: string
  highestThresholdPrice: string
  priceFormat: string
  quoteToken: string
  isShort: boolean
}

function AjnaContentCardPositionLendingPriceModal({
  positionLendingPrice,
  highestThresholdPrice,
  priceFormat,
  quoteToken,
  isShort,
}: AjnaContentCardPositionLendingPriceModalProps) {
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

interface AjnaContentCardPositionLendingPriceProps extends OmniContentCardCommonProps {
  afterPositionLendingPrice?: BigNumber
  highestThresholdPrice: BigNumber
  isShort: boolean
  positionLendingPrice: BigNumber
  priceColor: string
  priceColorIndex: number
  priceFormat: string
  quoteToken: string
  steps: number
  withTooltips?: boolean
}

export function AjnaContentCardPositionLendingPrice({
  afterPositionLendingPrice,
  changeVariant,
  highestThresholdPrice,
  isLoading,
  isShort,
  modalTheme,
  positionLendingPrice,
  priceColor,
  priceColorIndex,
  priceFormat,
  quoteToken,
  steps,
  withTooltips,
}: AjnaContentCardPositionLendingPriceProps) {
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
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.position-lending-price')}
        theme={modalTheme}
      >
        <AjnaContentCardPositionLendingPriceModal
          positionLendingPrice={formatted.positionLendingPrice}
          highestThresholdPrice={formatted.highestThresholdPrice}
          priceFormat={priceFormat}
          quoteToken={quoteToken}
          isShort={isShort}
        />
      </DetailsSectionContentSimpleModal>
    ),
  }

  if (withTooltips && !positionLendingPrice.isZero()) {
    contentCardSettings.valueTooltip = `${positionLendingPrice.dp(
      DEFAULT_TOKEN_DIGITS,
    )} ${priceFormat}`
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
