import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Text } from 'theme-ui'

interface AjnaContentCardThresholdPriceModalProps {
  collateralAmount: string
  debtAmount: string
  lup?: string
  thresholdPrice: string
}

interface AjnaContentCardThresholdPricePriceProps extends OmniContentCardCommonProps {
  afterThresholdPrice?: BigNumber
  collateralAmount: BigNumber
  debtAmount: BigNumber
  lup?: BigNumber
  priceFormat: string
  thresholdPrice: BigNumber
  withTooltips?: boolean
}

function AjnaContentCardThresholdPriceModal({
  collateralAmount,
  debtAmount,
  lup,
  thresholdPrice,
}: AjnaContentCardThresholdPriceModalProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.position-page.borrow.common.overview.threshold-price-modal-desc-part-1')}
      </Text>
      <Card
        variant="vaultDetailsCardModal"
        sx={{ my: 2, fontSize: 2, fontWeight: 'regular', lineHeight: 'body' }}
      >
        <code>
          TP = {t('ajna.position-page.borrow.common.overview.threshold-price-modal-desc-formula')}
          <br />
          {'\u00A0'}
          {'\u00A0'} = {debtAmount} / {collateralAmount}
          <br />
          {'\u00A0'}
          {'\u00A0'} = {thresholdPrice}
        </code>
      </Card>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.position-page.borrow.common.overview.threshold-price-modal-desc-part-2')}
      </Text>
      <Text variant="boldParagraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.position-page.borrow.common.overview.threshold-price-modal-desc-part-3')}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
        {t('ajna.position-page.borrow.common.overview.threshold-price-modal-desc-explanation-tp')}{' '}
        {thresholdPrice}
        {lup && (
          <>
            <br />
            {t(
              'ajna.position-page.borrow.common.overview.threshold-price-modal-desc-explanation-lup',
            )}{' '}
            {lup}
          </>
        )}
      </Card>
    </>
  )
}

export function AjnaContentCardThresholdPrice({
  afterThresholdPrice,
  changeVariant,
  collateralAmount,
  debtAmount,
  isLoading,
  lup,
  modalTheme,
  priceFormat,
  thresholdPrice,
  withTooltips,
}: AjnaContentCardThresholdPricePriceProps) {
  const { t } = useTranslation()

  const formatted = {
    thresholdPrice: formatCryptoBalance(thresholdPrice),
    collateralAmount: formatCryptoBalance(collateralAmount),
    debtAmount: formatCryptoBalance(debtAmount),
    afterThresholdPrice: afterThresholdPrice && formatCryptoBalance(afterThresholdPrice),
    lup: lup && formatCryptoBalance(lup),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.threshold-price'),
    value: `${formatted.thresholdPrice}`,
    unit: priceFormat,
    change: {
      isLoading,
      value: afterThresholdPrice && ['', `${formatted.afterThresholdPrice}`, `${priceFormat}`],
      ...(withTooltips &&
        afterThresholdPrice &&
        !afterThresholdPrice.isZero() && {
          tooltip: `${afterThresholdPrice.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`,
        }),
      variant: changeVariant,
    },
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.threshold-price')}
        theme={modalTheme}
      >
        <AjnaContentCardThresholdPriceModal
          thresholdPrice={formatted.thresholdPrice}
          collateralAmount={formatted.collateralAmount}
          debtAmount={formatted.debtAmount}
          lup={formatted.lup}
        />
      </DetailsSectionContentSimpleModal>
    ),
  }

  if (withTooltips && !thresholdPrice.isZero()) {
    contentCardSettings.valueTooltip = `${thresholdPrice.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`
  }

  if (lup) {
    contentCardSettings.footnote = ['LUP:', `${formatted.lup}`, `${priceFormat}`]
    contentCardSettings.footnoteTooltip = `${lup.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
