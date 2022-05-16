import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
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
  slRatio: BigNumber
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  lockedCollateral: BigNumber
  debt: BigNumber
  currentOraclePrice: BigNumber
  liquidationPenalty: BigNumber
  afterSlRatio: BigNumber
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
      <Text variant="subheader" sx={{ fontSize: 2, mt: 2 }}>
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
  slRatio,
  liquidationPrice,
  liquidationRatio,
  lockedCollateral,
  debt,
  currentOraclePrice,
  liquidationPenalty,
  afterSlRatio,
}: ContentCardEstTokenOnTriggerProps) {
  const { t } = useTranslation()

  const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slRatio)
  const afterDynamicStopPrice = liquidationPrice.div(liquidationRatio).times(afterSlRatio)
  const maxToken = !dynamicStopPrice.isZero()
    ? lockedCollateral.times(dynamicStopPrice).minus(debt).div(dynamicStopPrice)
    : zero
  const ethDuringLiquidation = lockedCollateral
    .times(liquidationPrice)
    .minus(debt.multipliedBy(one.plus(liquidationPenalty)))
    .div(liquidationPrice)
  const afterMaxToken = lockedCollateral
    .times(afterDynamicStopPrice)
    .minus(debt)
    .div(afterDynamicStopPrice)
  const savingCompareToLiquidation = maxToken.minus(ethDuringLiquidation)
  const symbol = isCollateralActive ? token : 'DAI'

  const formatTokenOrDai = (val: BigNumber): string => {
    return isCollateralActive
      ? `${formatAmount(val, token)} ${token}`
      : `${formatAmount(val.multipliedBy(currentOraclePrice), 'USD')} DAI`
  }

  const formatted = {
    title: t('manage-multiply-vault.card.max-token-on-stop-loss-trigger', {
      token: symbol,
    }),
    maxTokenOrDai: formatTokenOrDai(maxToken),
    savingTokenOrDai: formatTokenOrDai(savingCompareToLiquidation),
    afterMaxTokenOrDai: formatTokenOrDai(afterMaxToken),
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

  if (isStopLossEnabled && !maxToken.isZero()) contentCardSettings.value = formatted.maxTokenOrDai
  if (!slRatio.isZero() && !maxToken.isZero())
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
