import { useAutomationContext } from 'components/AutomationContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardBuyingPower } from 'components/vault/detailsSection/ContentCardBuyingPower'
import { ContentCardDynamicStopPriceWithColRatio } from 'components/vault/detailsSection/ContentCardDynamicStopPriceWithColRatio'
import { ContentCardLiquidationPrice } from 'components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentCardNetValue } from 'components/vault/detailsSection/ContentCardNetValue'
import { ContentFooterItemsMultiply } from 'components/vault/detailsSection/ContentFooterItemsMultiply'
import { UpdatedContentCardNetValue } from 'components/vault/detailsSection/UpdatedContentCardNetvalue'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { GetProtectionBannerControl } from 'features/automation/protection/stopLoss/controls/GetProtectionBannerControl'
import { StopLossTriggeredBannerControl } from 'features/automation/protection/stopLoss/controls/StopLossTriggeredBannerControl'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ManageMultiplyVaultState } from '../pipes/manageMultiplyVault'
import {
  calculateCurrentPnLInUSD,
  calculateTotalDepositWithdrawals,
  calculateTotalGasFeeInEth,
} from '../utils'

export function ManageMultiplyVaultDetails(props: ManageMultiplyVaultState) {
  const {
    vault: { token, liquidationPrice, debt, lockedCollateral, lockedCollateralUSD, ilk },
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
    vaultHistory,
  } = props
  const { t } = useTranslation()
  const { stopLossTriggerData } = useAutomationContext()
  const updatedPnlToogle = useFeatureToggle('UpdatedPnL')

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const oraclePrice = priceInfo.currentCollateralPrice

  const depositTotalAmounts = calculateTotalDepositWithdrawals(vaultHistory, 'DEPOSIT')
  const withdrawTotalAmounts = calculateTotalDepositWithdrawals(vaultHistory, 'WITHDRAW')
  const totalGasFeesInEth = calculateTotalGasFeeInEth(vaultHistory)
  const currentPnLInUSD = calculateCurrentPnLInUSD(currentPnL, netValueUSD)

  return (
    <Grid>
      {stopLossReadEnabled && <>{stopLossTriggered && <StopLossTriggeredBannerControl />}</>}
      <DetailsSection
        title={t('system.overview')}
        content={
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
            {updatedPnlToogle ? (
              <UpdatedContentCardNetValue
                token={token}
                oraclePrice={oraclePrice}
                marketPrice={marketPrice}
                netValueUSD={netValueUSD}
                afterNetValueUSD={afterNetValueUSD}
                totalGasSpentUSD={totalGasSpentUSD}
                currentPnL={currentPnL}
                currentPnLInUSD={currentPnLInUSD}
                lockedCollateral={lockedCollateral}
                lockedCollateralUSD={lockedCollateralUSD}
                debt={debt}
                changeVariant={changeVariant}
                depositTotalAmounts={depositTotalAmounts}
                withdrawTotalAmounts={withdrawTotalAmounts}
                totalGasFeesInEth={totalGasFeesInEth}
              />
            ) : (
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
            )}
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
        <GetProtectionBannerControl token={token} ilk={ilk} debt={debt} />
      )}
    </Grid>
  )
}
