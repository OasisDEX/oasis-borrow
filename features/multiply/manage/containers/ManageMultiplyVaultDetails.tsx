import { Box } from '@theme-ui/components'
import { IlkData } from 'blockchain/ilks'
import { useAppContext } from 'components/AppContextProvider'
import { ContentCardDynamicStopPriceWithColRatio } from 'components/vault/detailsSection/ContentCardDynamicStopPriceWithColRatio'
import { ContentFooterItemsMultiply } from 'components/vault/detailsSection/ContentFooterItemsMultiply'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { overrideWarningAutoSellTriggerIds } from 'features/automation/protection/common/consts/automationDefaults'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { GetProtectionBannerControl } from 'features/automation/protection/controls/GetProtectionBannerControl'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { DetailsSection } from '../../../../components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from '../../../../components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from '../../../../components/DetailsSectionFooterItem'
import { ContentCardBuyingPower } from '../../../../components/vault/detailsSection/ContentCardBuyingPower'
import { ContentCardLiquidationPrice } from '../../../../components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentCardNetValue } from '../../../../components/vault/detailsSection/ContentCardNetValue'
import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { StopLossTriggeredBannerControl } from '../../../automation/protection/controls/StopLossTriggeredBannerControl'
import { ManageMultiplyVaultState } from '../pipes/manageMultiplyVault'

export function ManageMultiplyVaultDetails(props: ManageMultiplyVaultState) {
  const {
    vault: { token, liquidationPrice, id, debt, lockedCollateral, lockedCollateralUSD, ilk },
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
    basicSellData,
  } = props
  const { t } = useTranslation()
  const { automationTriggersData$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(id)
  const [automationTriggersData] = useObservable(autoTriggersData$)

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const oraclePrice = priceInfo.currentCollateralPrice
  const slData = automationTriggersData ? extractStopLossData(automationTriggersData) : null

  const basicSellTriggerId = basicSellData?.triggerId.toNumber() || 0

  return (
    <Grid>
      {stopLossReadEnabled && <>{stopLossTriggered && <StopLossTriggeredBannerControl />}</>}
      <DetailsSection
        title={t('system.overview')}
        content={
          <>
            {overrideWarningAutoSellTriggerIds.includes(basicSellTriggerId) && (
              <Box mb={3}>
                <VaultWarnings
                  warningMessages={['autoSellOverride']}
                  ilkData={{ debtFloor: zero } as IlkData}
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
                vaultId={id}
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
              {slData && slData.isStopLossEnabled && (
                <ContentCardDynamicStopPriceWithColRatio
                  slData={slData}
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
        <GetProtectionBannerControl vaultId={id} token={token} ilk={ilk} debt={debt} />
      )}
    </Grid>
  )
}
