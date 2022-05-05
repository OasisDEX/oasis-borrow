import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardNetValue } from 'components/vault/detailsSection/ContentCardNetValue'
import { ContentFooterItemsMultiply } from 'components/vault/detailsSection/ContentFooterItemsMultiply'
import {
  AfterPillProps,
  getAfterPillColors,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useHasChangedSinceFirstRender } from 'helpers/useHasChangedSinceFirstRender'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { VaultDetailsCardNetValue } from '../../../../../components/vault/detailsCards/VaultDetailsCardNetValue'
import { formatAmount, formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { zero } from '../../../../../helpers/zero'
import { OpenGuniVaultState } from '../pipes/openGuniVault'

function GuniOpenMultiplyVaultDetailsSummary({
  token,
  afterPillColors,
  showAfterPill,
  afterOutstandingDebt,
  multiply,
  totalCollateral,
  relevant,
}: OpenGuniVaultState & AfterPillProps & { relevant: boolean }) {
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
        label={t('system.total-collateral', { token })}
        value={
          <>
            {formatCryptoBalance(zero)} {token}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatCryptoBalance(totalCollateral || zero)} {token}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.multiple')}
        value={
          <>
            {(0.0).toFixed(2)}x {t('system.exposure')}
          </>
        }
        valueAfter={showAfterPill && <>{multiply?.toFixed(2)}x</>}
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}

export function GuniOpenMultiplyVaultDetails(props: OpenGuniVaultState) {
  const { t } = useTranslation()
  const {
    token,
    afterNetValueUSD,
    inputAmountsEmpty,
    stage,
    netValueUSD,
    currentPnL,
    totalGasSpentUSD,
    priceInfo,
    afterOutstandingDebt,
    totalCollateral,
    multiply,
  } = props

  const afterCollRatioColor = 'onSuccess'
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
  const inputAmountChangedSinceFirstRender = useHasChangedSinceFirstRender(inputAmountsEmpty)
  const oraclePrice = priceInfo.currentCollateralPrice
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const automationBasicBuyAndSellEnabled = useFeatureToggle('AutomationBasicBuyAndSell')

  return (
    <>
      {!automationBasicBuyAndSellEnabled ? (
        <>
          <Grid variant="vaultDetailsCardsContainer">
            <VaultDetailsCardNetValue
              {...{
                netValueUSD,
                afterNetValueUSD,
                afterPillColors,
                showAfterPill,
                currentPnL,
                totalGasSpentUSD,
                priceInfo,
                vault: undefined,
                relevant: inputAmountChangedSinceFirstRender,
              }}
            />
          </Grid>
          <GuniOpenMultiplyVaultDetailsSummary
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
              <ContentCardNetValue
                token={token}
                oraclePrice={oraclePrice}
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
                afterLockedCollateral={totalCollateral}
                afterMultiply={multiply}
                changeVariant={changeVariant}
              />
            </DetailsSectionFooterItemWrapper>
          }
        />
      )}
    </>
  )
}
