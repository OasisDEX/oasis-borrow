import { getToken } from 'blockchain/tokensMetadata'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { MessageCard } from 'components/MessageCard'
import { ContentCardCollateralizationRatio } from 'components/vault/detailsSection/ContentCardCollateralizationRatio'
import { ContentCardCollateralLocked } from 'components/vault/detailsSection/ContentCardCollateralLocked'
import { ContentCardDynamicStopPriceWithColRatio } from 'components/vault/detailsSection/ContentCardDynamicStopPriceWithColRatio'
import { ContentCardLiquidationPrice } from 'components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentFooterItemsBorrow } from 'components/vault/detailsSection/ContentFooterItemsBorrow'
import type { AfterPillProps } from 'components/vault/VaultDetails'
import {
  getCollRatioColor,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { vaultIdsThatAutoBuyTriggerShouldBeRecreated } from 'features/automation/common/consts'
import { AutoTakeProfitTriggeredBanner } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitTriggeredBanner'
import { GetProtectionBannerControl } from 'features/automation/protection/stopLoss/controls/GetProtectionBannerControl'
import { StopLossTriggeredBanner } from 'features/automation/protection/stopLoss/controls/StopLossTriggeredBanner'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { useAppConfig } from 'helpers/config'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'
import { bell } from 'theme/icons'

export function ManageVaultDetailsSummary({
  vault: { debt, token, freeCollateral, daiYieldFromLockedCollateral },
  afterDebt,
  afterFreeCollateral,
  daiYieldFromTotalCollateral,
  afterPillColors,
  showAfterPill,
}: ManageMultiplyVaultState & AfterPillProps) {
  const { t } = useTranslation()
  const { symbol } = getToken(token)

  return (
    <VaultDetailsSummaryContainer>
      <VaultDetailsSummaryItem
        label={t('system.vault-dai-debt')}
        value={
          <>
            {formatAmount(debt, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterDebt, 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />

      <VaultDetailsSummaryItem
        label={t('system.available-to-withdraw')}
        value={
          <>
            {formatAmount(freeCollateral, symbol)}
            {` ${symbol}`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterFreeCollateral, symbol)}
              {` ${symbol}`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-generate')}
        value={
          <>
            {formatAmount(daiYieldFromLockedCollateral, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(daiYieldFromTotalCollateral, 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}

export function ManageVaultDetails(
  props: ManageMultiplyVaultState,
) {
  const {
    vault: {
      daiYieldFromLockedCollateral,
      debt,
      freeCollateral,
      token,
      liquidationPrice,
      lockedCollateral,
      lockedCollateralUSD,
      collateralizationRatio,
      ilk,
      id,
    },
    ilkData: { liquidationRatio },
    liquidationPriceCurrentPriceDifference,
    afterLiquidationPrice,
    afterCollateralizationRatio,
    afterLockedCollateralUSD,
    collateralizationRatioAtNextPrice,
    afterDebt,
    afterFreeCollateral,
    daiYieldFromTotalCollateral,
    inputAmountsEmpty,
    stage,
    stopLossTriggered,
    autoTakeProfitTriggered,
  } = props
  const { t } = useTranslation()
  const {
    triggerData: {
      stopLossTriggerData,
      autoBuyTriggerData: { isTriggerEnabled, maxBuyOrMinSellPrice },
    },
  } = useAutomationContext()

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const { StopLossRead: stopLossReadEnabled, StopLossWrite: stopLossWriteEnabled } =
    useAppConfig('features')

  const shouldShowOverrideAutoBuy =
    isTriggerEnabled &&
    maxBuyOrMinSellPrice.isZero() &&
    vaultIdsThatAutoBuyTriggerShouldBeRecreated.includes(id.toNumber())

  const notifications: DetailsSectionNotificationItem[] = [
    {
      closable: true,
      icon: bell,
      link: {
        translationKey: 'vault-info-messages.risk-management-for-borrow-link',
        url: 'https://blog.summer.fi/new-risk-management-tool',
      },
      title: {
        translationKey: 'vault-info-messages.risk-management-for-borrow-title',
      },
      message: {
        translationKey: 'vault-info-messages.risk-management-for-borrow-message',
      },
      type: 'notice',
    },
  ]

  return (
    <Grid>
      {stopLossReadEnabled && <>{stopLossTriggered && <StopLossTriggeredBanner />}</>}
      {<>{autoTakeProfitTriggered && <AutoTakeProfitTriggeredBanner />}</>}
      <DetailsSection
        title={t('system.overview')}
        content={
          <>
            {shouldShowOverrideAutoBuy && (
              <Box mb={3}>
                <MessageCard
                  type="warning"
                  messages={[t('vault-warnings.auto-buy-override')]}
                  withBullet={false}
                />
              </Box>
            )}
            <DetailsSectionContentCardWrapper>
              <ContentCardLiquidationPrice
                liquidationPrice={liquidationPrice}
                liquidationRatio={liquidationRatio}
                liquidationPriceCurrentPriceDifference={liquidationPriceCurrentPriceDifference}
                afterLiquidationPrice={afterLiquidationPrice}
                changeVariant={changeVariant}
              />
              <ContentCardCollateralizationRatio
                positionRatio={collateralizationRatio}
                nextPositionRatio={collateralizationRatioAtNextPrice}
                afterPositionRatio={afterCollateralizationRatio}
                changeVariant={changeVariant}
              />
              <ContentCardCollateralLocked
                token={token}
                lockedCollateralUSD={lockedCollateralUSD}
                lockedCollateral={lockedCollateral}
                afterLockedCollateralUSD={afterLockedCollateralUSD}
                changeVariant={changeVariant}
              />
              {stopLossTriggerData.isStopLossEnabled && (
                <ContentCardDynamicStopPriceWithColRatio
                  slData={stopLossTriggerData}
                  liquidationPrice={liquidationPrice}
                  afterLiquidationPrice={afterLiquidationPrice}
                  liquidationRatio={liquidationRatio}
                  changeVariant={changeVariant}
                />
              )}
            </DetailsSectionContentCardWrapper>
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsBorrow
              token={token}
              debt={debt}
              freeCollateral={freeCollateral}
              afterDebt={afterDebt}
              afterFreeCollateral={afterFreeCollateral}
              daiYieldFromLockedCollateral={daiYieldFromLockedCollateral}
              daiYieldFromTotalCollateral={daiYieldFromTotalCollateral}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
        notifications={notifications}
      />

      {stopLossReadEnabled && stopLossWriteEnabled && (
        <GetProtectionBannerControl token={token} ilk={ilk} debt={debt} vaultId={id} />
      )}
    </Grid>
  )
}
