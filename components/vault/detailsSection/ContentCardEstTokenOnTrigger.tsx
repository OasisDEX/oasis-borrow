import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { getDynamicStopLossPrice } from 'features/automation/protection/stopLoss/helpers'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

interface ContentCardEstTokenOnTriggerModalProps {
  token: string
  liquidationPenaltyFormatted: string
}

interface ContentCardEstTokenOnTriggerProps {
  isCollateralActive: boolean
  isStopLossEnabled: boolean
  isEditing: boolean
  token: string
  stopLossLevel: BigNumber
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  liquidationPenalty: BigNumber
  afterStopLossLevel: BigNumber
  triggerMaxToken: BigNumber
  collateralDuringLiquidation: BigNumber
  afterMaxToken: BigNumber
}

function ContentCardEstTokenOnTriggerModal({
  token,
  liquidationPenaltyFormatted,
}: ContentCardEstTokenOnTriggerModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">
        {t('manage-multiply-vault.card.max-token-on-stop-loss-trigger', { token })}
      </Heading>
      <Text variant="paragraph2" sx={{ mt: 2 }}>
        {t('manage-multiply-vault.card.max-token-on-stop-loss-trigger-desc', {
          token,
          liquidationPenalty: liquidationPenaltyFormatted,
        })}
      </Text>
    </Grid>
  )
}

export function ContentCardEstTokenOnTrigger({
  isCollateralActive,
  isStopLossEnabled,
  isEditing,
  token,
  stopLossLevel,
  liquidationPrice,
  liquidationPenalty,
  liquidationRatio,
  afterStopLossLevel,
  triggerMaxToken,
  afterMaxToken,
  collateralDuringLiquidation,
}: ContentCardEstTokenOnTriggerProps) {
  const { t } = useTranslation()

  const dynamicStopLossPrice = getDynamicStopLossPrice({
    liquidationPrice,
    liquidationRatio,
    stopLossLevel,
  })

  const afterDynamicStopLossPrice = getDynamicStopLossPrice({
    liquidationPrice,
    liquidationRatio,
    stopLossLevel: afterStopLossLevel,
  })

  const savingCompareToLiquidation = triggerMaxToken.minus(collateralDuringLiquidation)
  const symbol = isCollateralActive ? token : 'DAI'

  const formatTokenOrDai = (val: BigNumber, stopPrice: BigNumber): string => {
    return isCollateralActive
      ? `${formatAmount(val, token)} ${token}`
      : `${formatAmount(val.multipliedBy(stopPrice), 'USD')} DAI`
  }

  const formatted = {
    title: t('manage-multiply-vault.card.max-token-on-stop-loss-trigger', {
      token: symbol,
    }),
    maxTokenOrDai: formatTokenOrDai(triggerMaxToken, dynamicStopLossPrice),
    savingTokenOrDai: formatTokenOrDai(savingCompareToLiquidation, dynamicStopLossPrice),
    afterMaxTokenOrDai: formatTokenOrDai(afterMaxToken, afterDynamicStopLossPrice),
    liquidationPenalty: formatPercent(liquidationPenalty.multipliedBy(100), {
      precision: 2,
    }),
  }

  const contentCardModalSettings: ContentCardEstTokenOnTriggerModalProps = {
    token: symbol,
    liquidationPenaltyFormatted: formatted.liquidationPenalty,
  }

  const contentCardSettings: ContentCardProps = {
    title: formatted.title,
    modal: <ContentCardEstTokenOnTriggerModal {...contentCardModalSettings} />,
  }

  if (isStopLossEnabled && !triggerMaxToken.isZero())
    contentCardSettings.value = formatted.maxTokenOrDai
  if (!afterStopLossLevel.isZero() && !triggerMaxToken.isZero())
    contentCardSettings.footnote = `${formatted.savingTokenOrDai} ${t(
      'manage-multiply-vault.card.saving-comp-to-liquidation',
    )}`
  if (isEditing)
    contentCardSettings.change = {
      value: `${t('manage-multiply-vault.card.up-to')} ${formatted.afterMaxTokenOrDai} ${t(
        'system.cards.common.after',
      )}`,
      variant: 'positive',
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
