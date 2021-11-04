import BigNumber from 'bignumber.js'
import {
  AfterPillProps,
  getAfterPillColors,
  VaultDetailsCardNetValue,
  VaultDetailsCardProfitAndLoss,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { formatAmount, formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { zero } from '../../../../../helpers/zero'
import { OpenMultiplyVaultState } from '../../../openMultiplyVault'

function GuniOpenMultiplyVaultDetailsSummary({
  token,
  afterPillColors,
  showAfterPill,
  afterOutstandingDebt,
  multiply,
  // @ts-ignore
  totalCollateral = new BigNumber(12345), // TODO TBD within pipeline
}: OpenMultiplyVaultState & AfterPillProps) {
  const { t } = useTranslation()

  return (
    <VaultDetailsSummaryContainer>
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

export function GuniOpenMultiplyVaultDetails(props: OpenMultiplyVaultState) {
  const {
    afterNetValueUSD,
    // @ts-ignore
    afterProfitAndLossUSD = new BigNumber(12345), // TODO TBD within pipeline
    inputAmountsEmpty,
    stage,
  } = props

  // initial values only to show in UI as starting parameters
  const netValueUSD = zero
  const profitAndLossUSD = zero

  const afterCollRatioColor = 'onSuccess'
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'openSuccess'
  return (
    <>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCardNetValue
          {...{
            netValueUSD,
            afterNetValueUSD,
            afterPillColors,
            showAfterPill,
          }}
        />
        <VaultDetailsCardProfitAndLoss
          {...{
            profitAndLossUSD,
            afterProfitAndLossUSD,
            afterPillColors,
            showAfterPill,
          }}
        />
      </Grid>
      <GuniOpenMultiplyVaultDetailsSummary
        {...props}
        afterPillColors={afterPillColors}
        showAfterPill={showAfterPill}
      />
    </>
  )
}
