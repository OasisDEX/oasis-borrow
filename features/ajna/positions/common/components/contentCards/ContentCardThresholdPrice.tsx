import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Text } from 'theme-ui'

interface ContentCardThresholdPriceModalProps {
  thresholdPrice: string
}

interface ContentCardThresholdPriceProps {
  isLoading?: boolean
  priceFormat: string
  thresholdPrice: BigNumber
  afterThresholdPrice?: BigNumber
  lup?: BigNumber
  changeVariant?: ChangeVariantType
}

function ContentCardThresholdPriceModal({ thresholdPrice }: ContentCardThresholdPriceModalProps) {
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
          TP ={' '}
          {t('ajna.position-page.borrow.common.overview.threshold-price-modal-desc-formula-part-1')}
          <br />
          {'\u00A0'}{'\u00A0'} ={' '}
          {t('ajna.position-page.borrow.common.overview.threshold-price-modal-desc-formula-part-2')}
          <br />
          {'\u00A0'}{'\u00A0'} = {thresholdPrice}
        </code>
      </Card>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.position-page.borrow.common.overview.threshold-price-modal-desc-part-2')}
      </Text>
      <Text variant="boldParagraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.position-page.borrow.common.overview.threshold-price-modal-desc-part-3')}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
        {t(
          'ajna.position-page.borrow.common.overview.threshold-price-modal-desc-explanation-part-1',
        )}
        <br />
        {t(
          'ajna.position-page.borrow.common.overview.threshold-price-modal-desc-explanation-part-2',
        )}
      </Card>
    </>
  )
}

export function ContentCardThresholdPrice({
  isLoading,
  priceFormat,
  thresholdPrice,
  afterThresholdPrice,
  lup,
  changeVariant = 'positive',
}: ContentCardThresholdPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    thresholdPrice: formatCryptoBalance(thresholdPrice),
    afterThresholdPrice: afterThresholdPrice && formatCryptoBalance(afterThresholdPrice),
    lup: lup && formatCryptoBalance(lup),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.threshold-price'),
    value: `${formatted.thresholdPrice}`,
    unit: priceFormat,
    change: {
      isLoading,
      value: afterThresholdPrice && `${formatted.afterThresholdPrice} ${priceFormat}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.threshold-price')}
      >
        <ContentCardThresholdPriceModal thresholdPrice={formatted.thresholdPrice} />
      </AjnaDetailsSectionContentSimpleModal>
    ),
  }

  if (lup) {
    contentCardSettings.footnote = `LUP: ${formatted.lup} ${priceFormat}`
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
