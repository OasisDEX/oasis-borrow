import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import { VaultDetailsCardNetValue } from 'components/vault/detailsCards/VaultDetailsCardNetValue'
import { ContentFooterItemsMultiply } from 'components/vault/detailsSection/ContentFooterItemsMultiply'
import {
  AfterPillProps,
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { DetailsSection } from '../../../../components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from '../../../../components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from '../../../../components/DetailsSectionFooterItem'
import { VaultDetailsBuyingPowerModal } from '../../../../components/vault/detailsCards/VaultDetailsBuyingPower'
import { VaultDetailsCardLiquidationPrice } from '../../../../components/vault/detailsCards/VaultDetailsCardLiquidationPrice'
import { ContentCardBuyingPower } from '../../../../components/vault/detailsSection/ContentCardBuyingPower'
import { ContentCardLiquidationPrice } from '../../../../components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentCardNetValue } from '../../../../components/vault/detailsSection/ContentCardNetValue'
import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
// import { GetProtectionBannerControl } from '../../../automation/protection/controls/GetProtectionBannerControl'
import { StopLossBannerControl } from '../../../automation/protection/controls/StopLossBannerControl'
import { StopLossTriggeredBannerControl } from '../../../automation/protection/controls/StopLossTriggeredBannerControl'
import { ManageMultiplyVaultState } from '../pipes/manageMultiplyVault'

function DefaultManageMultiplyVaultDetailsSummary({
  vault: { debt, token, lockedCollateral },
  afterDebt,
  afterPillColors,
  showAfterPill,
  multiply,
  afterMultiply,
  afterLockedCollateral,
}: ManageMultiplyVaultState & AfterPillProps) {
  const { t } = useTranslation()

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
        label={t('system.total-exposure', { token })}
        value={
          <>
            {formatCryptoBalance(lockedCollateral)} {token}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatCryptoBalance(afterLockedCollateral || zero)} {token}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.multiple')}
        value={<>{multiply?.toFixed(2)}x</>}
        valueAfter={showAfterPill && <>{afterMultiply?.toFixed(2)}x</>}
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}

export function ManageMultiplyVaultDetails(props: ManageMultiplyVaultState) {
  const {
    vault: { token, liquidationPrice, id, debt, lockedCollateral, lockedCollateralUSD /* , ilk */ },
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
    vault,
    priceInfo,
    stopLossTriggered,
  } = props
  const openModal = useModal()
  const { t } = useTranslation()
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const automationEnabled = useFeatureToggle('Automation')
  const newComponentsEnabled = useFeatureToggle('NewComponents')
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const oraclePrice = priceInfo.currentCollateralPrice

  return (
    <Box>
      {automationEnabled && (
        <>
          {stopLossTriggered && <StopLossTriggeredBannerControl />}
          {/* {!newComponentsEnabled && (
            <GetProtectionBannerControl vaultId={id} ilk={ilk} debt={debt} />
          )} */}
          <StopLossBannerControl
            vaultId={id}
            liquidationPrice={liquidationPrice}
            liquidationRatio={liquidationRatio}
            afterLiquidationPrice={afterLiquidationPrice}
            showAfterPill={showAfterPill}
          />
        </>
      )}
      {!newComponentsEnabled ? (
        <>
          <Grid variant="vaultDetailsCardsContainer">
            <VaultDetailsCardLiquidationPrice
              {...{
                liquidationPrice,
                liquidationRatio,
                liquidationPriceCurrentPriceDifference,
                afterLiquidationPrice,
                afterPillColors,
                showAfterPill,
                vaultId: id,
              }}
            />

            <VaultDetailsCard
              title={`Buying Power`}
              value={`$${formatAmount(buyingPowerUSD, 'USD')}`}
              valueBottom={`${formatAmount(buyingPower, token)} ${token}`}
              valueAfter={showAfterPill && `$${formatAmount(afterBuyingPowerUSD, 'USD')}`}
              openModal={() => openModal(VaultDetailsBuyingPowerModal)}
              afterPillColors={afterPillColors}
            />

            <VaultDetailsCardCurrentPrice {...props.priceInfo} />

            <VaultDetailsCardNetValue
              {...{
                netValueUSD,
                afterNetValueUSD,
                afterPillColors,
                showAfterPill,
                currentPnL,
                marketPrice,
                totalGasSpentUSD,
                vault,
                priceInfo,
              }}
            />
          </Grid>
          <DefaultManageMultiplyVaultDetailsSummary
            {...props}
            afterPillColors={afterPillColors}
            showAfterPill={showAfterPill}
          />
        </>
      ) : (
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
      )}
      {/* {automationEnabled && newComponentsEnabled && (
        <Box sx={{ mt: 3 }}>
          <GetProtectionBannerControl vaultId={id} token={token} ilk={ilk} debt={debt} />
        </Box>
      )} */}
    </Box>
  )
}
