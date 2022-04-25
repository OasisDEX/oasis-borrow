import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { extractStopLossData } from 'features/automation/protection/common/StopLossTriggerDataExtractor'
import { StopLossBannerControl } from 'features/automation/protection/controls/StopLossBannerControl'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import { Card, Grid, Heading, Text } from 'theme-ui'

import { zero } from '../../../helpers/zero'

interface ContentCardLiquidationPriceModalProps {
  liquidationPrice: BigNumber
  liquidationPriceFormatted: string
  liquidationRatio: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  liquidationPriceCurrentPriceDifferenceFormatted?: string
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
  liquidationPriceCurrentPriceDifferenceFormatted,
  vaultId,
  isStopLossEnabled,
}: ContentCardLiquidationPriceModalProps) {
  const { t } = useTranslation()
  const automationEnabled = useFeatureToggle('Automation')

  return (
    <Grid gap={2}>
      <Heading variant="header3">{`${t('system.liquidation-price')}`}</Heading>
      <Text as="p" variant="subheader" sx={{ fontSize: 2, mb: 2 }}>
        {!automationEnabled
          ? t('manage-multiply-vault.card.liquidation-price-description')
          : t('manage-multiply-vault.card.liquidation-price-description-AUTO')}
      </Text>
      <Card as="p" variant="vaultDetailsCardModal">
        {liquidationPriceFormatted}
      </Card>
      {liquidationPriceCurrentPriceDifference && (
        <Text as="p" variant="subheader" sx={{ fontSize: 2, mt: 1 }}>
          {liquidationPriceCurrentPriceDifferenceFormatted}
        </Text>
      )}
      {automationEnabled && isStopLossEnabled && vaultId && (
        <>
          <Heading variant="header3" sx={{ mt: 3 }}>{`${t('system.vault-protection')}`}</Heading>
          <Text as="p" variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
            {t('protection.modal-description')}
          </Text>
          <StopLossBannerControl
            liquidationPrice={liquidationPrice}
            liquidationRatio={liquidationRatio}
            vaultId={vaultId}
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
  const { automationTriggersData$ } = useAppContext()
  const automationEnabled = useFeatureToggle('Automation')

  const formatted = {
    liquidationPrice: `$${formatAmount(liquidationPrice, 'USD')}`,
    liquidationPriceCurrentPriceDifference:
      liquidationPriceCurrentPriceDifference &&
      t('system.cards.liquidation-price.footnote', {
        amount: formatPercent(liquidationPriceCurrentPriceDifference.times(100).absoluteValue(), {
          precision: 2,
          roundMode: BigNumber.ROUND_DOWN,
        }),
        level: liquidationPriceCurrentPriceDifference.lt(zero) ? t('above') : t('below'),
      }),
    afterLiquidationPrice: `$${formatAmount(afterLiquidationPrice || zero, 'USD')}`,
  }

  const contentCardModalSettings: ContentCardLiquidationPriceModalProps = {
    liquidationPrice,
    liquidationPriceFormatted: formatted.liquidationPrice,
    liquidationRatio,
    liquidationPriceCurrentPriceDifference,
    liquidationPriceCurrentPriceDifferenceFormatted:
      formatted.liquidationPriceCurrentPriceDifference,
    vaultId,
  }

  if (vaultId && automationEnabled) {
    const autoTriggersData$ = automationTriggersData$(vaultId)
    const [automationTriggersData] = useObservable(autoTriggersData$)
    const slData = automationTriggersData ? extractStopLossData(automationTriggersData) : null

    contentCardModalSettings.isStopLossEnabled = slData?.isStopLossEnabled
  }

  const contentCardSettings: ContentCardProps = {
    title: t('system.liquidation-price'),
    value: formatted.liquidationPrice,
    modal: <ContentCardLiquidationPriceModal {...contentCardModalSettings} />,
  }

  if (afterLiquidationPrice && changeVariant) {
    contentCardSettings.change = {
      value: formatted.afterLiquidationPrice,
      variant: changeVariant,
    }
  }
  if (liquidationPriceCurrentPriceDifference)
    contentCardSettings.footnote = formatted.liquidationPriceCurrentPriceDifference

  return <DetailsSectionContentCard {...contentCardSettings} />
}
