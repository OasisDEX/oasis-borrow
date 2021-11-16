import {
  AfterPillProps,
  getAfterPillColors,
  VaultDetailsCardNetValue,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { formatAmount, formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { zero } from '../../../../../helpers/zero'
import { OpenGuniVaultState } from '../../../../openGuniVault/openGuniVault'

function GuniOpenMultiplyVaultDetailsSummary({
  token,
  afterPillColors,
  showAfterPill,
  afterOutstandingDebt,
  multiply,
  totalCollateral,
}: OpenGuniVaultState & AfterPillProps) {
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

export function GuniOpenMultiplyVaultDetails(props: OpenGuniVaultState) {
  const { afterNetValueUSD, inputAmountsEmpty, stage, netValueUSD } = props

  const afterCollRatioColor = 'onSuccess'
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
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
      </Grid>
      <GuniOpenMultiplyVaultDetailsSummary
        {...props}
        afterPillColors={afterPillColors}
        showAfterPill={showAfterPill}
      />
    </>
  )
}
