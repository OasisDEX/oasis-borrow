import BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { StopLossBannerControl } from 'features/automation/protection/stopLoss/controls/StopLossBannerControl'
import { useAppConfig } from 'helpers/config'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface ContentCardLiquidationPriceModalProps {
  liquidationPrice: BigNumber
  liquidationPriceFormatted: string
  liquidationRatio: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  liquidationPriceCurrentPriceDifferenceLevel?: string
  vaultId?: BigNumber
  isStopLossEnabled?: boolean
}
interface ContentCardLiquidationPriceProps {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  afterLiquidationPrice?: BigNumber
  changeVariant?: ChangeVariantType
  vaultId?: BigNumber
}

function ContentCardLiquidationPriceModal({
  liquidationPrice,
  liquidationPriceFormatted,
  liquidationRatio,
  liquidationPriceCurrentPriceDifference,
  liquidationPriceCurrentPriceDifferenceLevel,
  isStopLossEnabled,
}: ContentCardLiquidationPriceModalProps) {
  const { t } = useTranslation()
  const { StopLossRead: stopLossReadEnabled } = useAppConfig('features')

  return (
    <Grid gap={2}>
      <Heading variant="header3">{`${t('system.liquidation-price')}`}</Heading>
      <Text as="p" variant="paragraph2">
        {!stopLossReadEnabled
          ? t('manage-multiply-vault.card.liquidation-price-description')
          : t('manage-multiply-vault.card.liquidation-price-description-AUTO')}
      </Text>
      <Card as="p" variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {liquidationPriceFormatted}
      </Card>
      {liquidationPriceCurrentPriceDifference && (
        <Text as="p" variant="paragraph2">
          {t('system.cards.liquidation-price.modal.price-relation', {
            level: liquidationPriceCurrentPriceDifferenceLevel,
          })}
        </Text>
      )}
      {stopLossReadEnabled && isStopLossEnabled && (
        <>
          <Heading variant="header3" sx={{ mt: 3 }}>{`${t('system.vault-protection')}`}</Heading>
          <Text as="p" variant="paragraph2" sx={{ mb: 2 }}>
            {t('protection.modal-description')}
          </Text>
          <StopLossBannerControl
            liquidationPrice={liquidationPrice}
            liquidationRatio={liquidationRatio}
            onClick={close}
            compact
          />
        </>
      )}
    </Grid>
  )
}

export function ContentCardLiquidationPrice({
  liquidationPrice,
  liquidationRatio,
  liquidationPriceCurrentPriceDifference,
  afterLiquidationPrice,
  changeVariant,
  vaultId,
}: ContentCardLiquidationPriceProps) {
  const { t } = useTranslation()
  const { StopLossRead: stopLossReadEnabled } = useAppConfig('features')

  const formatted = {
    liquidationPrice: `$${formatAmount(liquidationPrice, 'USD')}`,
    liquidationPriceCurrentPriceDifference:
      liquidationPriceCurrentPriceDifference &&
      formatPercent(liquidationPriceCurrentPriceDifference.times(100).absoluteValue(), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    liquidationPriceCurrentPriceDifferenceLevel:
      liquidationPriceCurrentPriceDifference && liquidationPriceCurrentPriceDifference.lt(zero)
        ? t('above')
        : t('below'),
    afterLiquidationPrice:
      afterLiquidationPrice && `$${formatAmount(afterLiquidationPrice || zero, 'USD')}`,
  }

  const contentCardModalSettings: ContentCardLiquidationPriceModalProps = {
    liquidationPrice,
    liquidationPriceFormatted: formatted.liquidationPrice,
    liquidationRatio,
    liquidationPriceCurrentPriceDifference,
    liquidationPriceCurrentPriceDifferenceLevel:
      formatted.liquidationPriceCurrentPriceDifferenceLevel,
  }

  if (stopLossReadEnabled && vaultId) {
    const {
      triggerData: { stopLossTriggerData },
    } = useAutomationContext()

    contentCardModalSettings.isStopLossEnabled = stopLossTriggerData.isStopLossEnabled
  }

  const contentCardSettings: ContentCardProps = {
    title: t('system.liquidation-price'),
    value: formatted.liquidationPrice,
    modal: <ContentCardLiquidationPriceModal {...contentCardModalSettings} />,
  }

  if (afterLiquidationPrice && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterLiquidationPrice} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (liquidationPriceCurrentPriceDifference)
    contentCardSettings.footnote = t('system.cards.liquidation-price.footnote', {
      amount: formatted.liquidationPriceCurrentPriceDifference,
      level: formatted.liquidationPriceCurrentPriceDifferenceLevel,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
