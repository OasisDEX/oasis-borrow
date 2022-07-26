import { Box } from '@theme-ui/components'
import { IlkData } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardCollateralizationRatio } from 'components/vault/detailsSection/ContentCardCollateralizationRatio'
import { ContentCardCollateralLocked } from 'components/vault/detailsSection/ContentCardCollateralLocked'
import { ContentCardDynamicStopPriceWithColRatio } from 'components/vault/detailsSection/ContentCardDynamicStopPriceWithColRatio'
import { ContentCardLiquidationPrice } from 'components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentFooterItemsBorrow } from 'components/vault/detailsSection/ContentFooterItemsBorrow'
import {
  AfterPillProps,
  getCollRatioColor,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { overrideWarningAutoSellTriggerIds } from 'features/automation/protection/common/consts/automationDefaults'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { GetProtectionBannerControl } from 'features/automation/protection/controls/GetProtectionBannerControl'
import { formatAmount } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
// import { GetProtectionBannerControl } from '../../../automation/protection/controls/GetProtectionBannerControl'
import { StopLossTriggeredBannerControl } from '../../../automation/protection/controls/StopLossTriggeredBannerControl'
import { BonusContainer } from '../../../bonus/BonusContainer'
import { ManageStandardBorrowVaultState } from '../pipes/manageVault'

export function ManageVaultDetailsSummary({
  vault: { debt, token, freeCollateral, daiYieldFromLockedCollateral },
  afterDebt,
  afterFreeCollateral,
  daiYieldFromTotalCollateral,
  afterPillColors,
  showAfterPill,
}: ManageStandardBorrowVaultState & AfterPillProps) {
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
  props: ManageStandardBorrowVaultState & { onBannerButtonClickHandler: () => void },
) {
  const {
    vault: {
      daiYieldFromLockedCollateral,
      debt,
      freeCollateral,
      id,
      token,
      liquidationPrice,
      lockedCollateral,
      lockedCollateralUSD,
      collateralizationRatio,
      ilk,
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
    basicSellData,
  } = props
  const { t } = useTranslation()
  const { automationTriggersData$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(id)
  const [automationTriggersData] = useObservable(autoTriggersData$)

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')
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
              <ContentCardCollateralizationRatio
                collateralizationRatio={collateralizationRatio}
                collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
                afterCollateralizationRatio={afterCollateralizationRatio}
                changeVariant={changeVariant}
              />
              <ContentCardCollateralLocked
                token={token}
                lockedCollateralUSD={lockedCollateralUSD}
                lockedCollateral={lockedCollateral}
                afterLockedCollateralUSD={afterLockedCollateralUSD}
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
      />

      {stopLossReadEnabled && stopLossWriteEnabled && (
        <GetProtectionBannerControl vaultId={id} token={token} ilk={ilk} debt={debt} />
      )}
      <BonusContainer cdpId={props.vault.id} />
    </Grid>
  )
}
