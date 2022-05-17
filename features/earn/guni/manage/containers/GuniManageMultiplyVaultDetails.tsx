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
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { VaultDetailsCardNetValue } from '../../../../../components/vault/detailsCards/VaultDetailsCardNetValue'
import { ManageMultiplyVaultState } from '../../../../multiply/manage/pipes/manageMultiplyVault'

function GuniManageMultiplyVaultDetailsSummary({
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
        label={t('system.total-collateral', { token })}
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
        value={
          <>
            {multiply?.toFixed(2)}x {t('system.exposure')}
          </>
        }
        valueAfter={showAfterPill && <>{afterMultiply?.toFixed(2)}x</>}
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}

export function GuniManageMultiplyVaultDetails(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const {
    vault: { debt, token, lockedCollateral, lockedCollateralUSD },
    inputAmountsEmpty,
    stage,
    netValueUSD,
    afterNetValueUSD,
    currentPnL,
    totalGasSpentUSD,
    vault,
    priceInfo,
    marketPrice,
    multiply,
    afterDebt,
    afterLockedCollateral,
    afterMultiply,
  } = props
  const afterCollRatioColor = 'onSuccess'
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const oraclePrice = priceInfo.currentCollateralPrice
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const newComponentsEnabled = useFeatureToggle('NewComponents')

  return (
    <Box>
      {!newComponentsEnabled ? (
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
                vault,
                priceInfo,
              }}
            />
          </Grid>
          <GuniManageMultiplyVaultDetailsSummary
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
    </Box>
  )
}
