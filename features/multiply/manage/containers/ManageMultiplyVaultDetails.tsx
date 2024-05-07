import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { MessageCard } from 'components/MessageCard'
import { ContentCardBuyingPower } from 'components/vault/detailsSection/ContentCardBuyingPower'
import { ContentCardDynamicStopPriceWithColRatio } from 'components/vault/detailsSection/ContentCardDynamicStopPriceWithColRatio'
import { ContentCardLiquidationPrice } from 'components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentCardNetValue } from 'components/vault/detailsSection/ContentCardNetValue'
import { ContentFooterItemsMultiply } from 'components/vault/detailsSection/ContentFooterItemsMultiply'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { vaultIdsThatAutoBuyTriggerShouldBeRecreated } from 'features/automation/common/consts'
import { AutoTakeProfitTriggeredBanner } from 'features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitTriggeredBanner'
import { GetProtectionBannerControl } from 'features/automation/protection/stopLoss/controls/GetProtectionBannerControl'
import { StopLossTriggeredBanner } from 'features/automation/protection/stopLoss/controls/StopLossTriggeredBanner'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { RefinanceBanner } from 'features/refinance/components'
import { useAppConfig } from 'helpers/config'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

export function ManageMultiplyVaultDetails(props: ManageMultiplyVaultState) {
  const {
    vault: { token, liquidationPrice, debt, lockedCollateral, lockedCollateralUSD, ilk, id },
    ilkData: { liquidationRatio },
    afterDebt,
    afterLockedCollateral,
    multiply,
    afterMultiply,
    liquidationPriceCurrentPriceDifference,
    afterLiquidationPrice,
    afterCollateralizationRatio,
    inputAmountsEmpty,
    stage,
    netValueUSD,
    afterNetValueUSD,
    buyingPower,
    buyingPowerUSD,
    afterBuyingPowerUSD,
    currentPnL,
    marketPrice,
    totalGasSpentUSD,
    priceInfo,
    stopLossTriggered,
    autoTakeProfitTriggered,
    refinanceContextInput,
  } = props
  const { t } = useTranslation()
  const {
    triggerData: {
      stopLossTriggerData,
      autoBuyTriggerData: { maxBuyOrMinSellPrice, isTriggerEnabled },
    },
  } = useAutomationContext()

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const {
    StopLossRead: stopLossReadEnabled,
    StopLossWrite: stopLossWriteEnabled,
    EnableRefinance: refinanceEnabled,
  } = useAppConfig('features')
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const oraclePrice = priceInfo.currentCollateralPrice

  const shouldShowOverrideAutoBuy =
    isTriggerEnabled &&
    maxBuyOrMinSellPrice.isZero() &&
    vaultIdsThatAutoBuyTriggerShouldBeRecreated.includes(id.toNumber())

  return (
    <Grid>
      {stopLossReadEnabled && <>{stopLossTriggered && <StopLossTriggeredBanner />}</>}
      {autoTakeProfitTriggered && <AutoTakeProfitTriggeredBanner />}
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
              <ContentCardBuyingPower
                token={token}
                buyingPower={buyingPower}
                buyingPowerUSD={buyingPowerUSD}
                afterBuyingPowerUSD={afterBuyingPowerUSD}
                changeVariant={changeVariant}
              />
              <ContentCardNetValue
                token={token}
                oraclePrice={oraclePrice}
                marketPrice={marketPrice}
                netValueUSD={netValueUSD}
                afterNetValueUSD={afterNetValueUSD}
                totalGasSpentUSD={totalGasSpentUSD}
                currentPnL={currentPnL}
                lockedCollateral={lockedCollateral}
                lockedCollateralUSD={lockedCollateralUSD}
                debt={debt}
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
            <ContentFooterItemsMultiply
              token={token}
              debt={debt}
              lockedCollateral={lockedCollateral}
              multiply={multiply}
              afterDebt={afterDebt}
              afterLockedCollateral={afterLockedCollateral}
              afterMultiply={afterMultiply}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      {stopLossReadEnabled && stopLossWriteEnabled && (
        <GetProtectionBannerControl token={token} ilk={ilk} debt={debt} vaultId={id} />
      )}
      {refinanceEnabled && <RefinanceBanner contextInput={refinanceContextInput} />}
    </Grid>
  )
}
