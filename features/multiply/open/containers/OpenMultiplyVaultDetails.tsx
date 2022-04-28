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
import { useHasChangedSinceFirstRender } from 'helpers/useHasChangedSinceFirstRender'
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
import { VaultDetailsBuyingPowerModal } from '../../../../components/vault/detailsCards/VaultDetailsBuyingPower'
import { VaultDetailsCardLiquidationPrice } from '../../../../components/vault/detailsCards/VaultDetailsCardLiquidationPrice'
import { ContentCardBuyingPower } from '../../../../components/vault/detailsSection/ContentCardBuyingPower'
import { ContentCardLiquidationPrice } from '../../../../components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentCardNetValue } from '../../../../components/vault/detailsSection/ContentCardNetValue'
import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { OpenMultiplyVaultState } from '../pipes/openMultiplyVault'

function OpenMultiplyVaultDetailsSummary({
  token,
  afterPillColors,
  showAfterPill,
  afterOutstandingDebt,
  multiply,
  totalExposure,
  relevant,
}: OpenMultiplyVaultState & AfterPillProps & { relevant: boolean }) {
  const { t } = useTranslation()

  return (
    <VaultDetailsSummaryContainer relevant={relevant}>
      <VaultDetailsSummaryItem
        label={t('system.vault-dai-debt')}
        value={
          <>
            {formatAmount(zero, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterOutstandingDebt, 'DAI')}
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
            {formatCryptoBalance(zero)} {token}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatCryptoBalance(totalExposure || zero)} {token}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.multiple')}
        value={<>{(0.0).toFixed(2)}x</>}
        valueAfter={showAfterPill && <>{multiply?.toFixed(2)}x</>}
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}

export function OpenMultiplyVaultDetails(props: OpenMultiplyVaultState) {
  const {
    afterLiquidationPrice,
    afterCollateralizationRatio,
    afterBuyingPowerUSD,
    afterNetValueUSD,
    token,
    inputAmountsEmpty,
    stage,
    marketPrice,
    priceInfo,
    ilkData: { liquidationRatio },
    afterOutstandingDebt,
    totalExposure,
    multiply,
  } = props
  const openModal = useModal()
  const { t } = useTranslation()

  // initial values only to show in UI as starting parameters
  const liquidationPrice = zero
  const buyingPowerUSD = zero
  const buyingPower = zero
  const netValueUSD = zero
  const currentPnL = zero

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
  const inputAmountChangedSinceFirstRender = useHasChangedSinceFirstRender(inputAmountsEmpty)
  const automationBasicBuyAndSellEnabled = useFeatureToggle('AutomationBasicBuyAndSell')
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const oraclePrice = priceInfo.currentCollateralPrice

  return !automationBasicBuyAndSellEnabled ? (
    <>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCardLiquidationPrice
          {...{
            liquidationPrice,
            liquidationRatio,
            afterLiquidationPrice,
            afterPillColors,
            showAfterPill,
            relevant: inputAmountChangedSinceFirstRender,
          }}
        />

        <VaultDetailsCard
          title={`Buying Power`}
          value={`$${formatAmount(buyingPowerUSD, 'USD')}`}
          valueBottom={`${formatAmount(buyingPower, token)} ${token}`}
          valueAfter={showAfterPill && `$${formatAmount(afterBuyingPowerUSD, 'USD')}`}
          openModal={() => openModal(VaultDetailsBuyingPowerModal)}
          afterPillColors={afterPillColors}
          relevant={inputAmountChangedSinceFirstRender}
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
            totalGasSpentUSD: zero,
            vault: undefined,
            priceInfo,
            relevant: inputAmountChangedSinceFirstRender,
          }}
        />
      </Grid>
      <OpenMultiplyVaultDetailsSummary
        {...props}
        afterPillColors={afterPillColors}
        showAfterPill={showAfterPill}
        relevant={inputAmountChangedSinceFirstRender}
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
            afterLiquidationPrice={afterLiquidationPrice}
            changeVariant={changeVariant}
          />
          <ContentCardBuyingPower
            token={token}
            buyingPowerUSD={buyingPowerUSD}
            afterBuyingPowerUSD={afterBuyingPowerUSD}
            changeVariant={changeVariant}
          />
          <ContentCardNetValue
            token={token}
            oraclePrice={oraclePrice}
            marketPrice={marketPrice}
            afterNetValueUSD={afterNetValueUSD}
            changeVariant={changeVariant}
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <ContentFooterItemsMultiply
            token={token}
            debt={zero}
            lockedCollateral={zero}
            multiply={zero}
            afterDebt={afterOutstandingDebt}
            afterLockedCollateral={totalExposure}
            afterMultiply={multiply}
            changeVariant={changeVariant}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
