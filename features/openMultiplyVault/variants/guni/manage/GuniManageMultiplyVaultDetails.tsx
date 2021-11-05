import {
  AfterPillProps,
  getAfterPillColors,
  VaultDetailsCardNetValue,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { ManageMultiplyVaultState } from '../../../../manageMultiplyVault/manageMultiplyVault'

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
  const { inputAmountsEmpty, stage, netValueUSD, afterNetValueUSD } = props
  const afterCollRatioColor = 'onSuccess'
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'

  return (
    <Box>
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
      <GuniManageMultiplyVaultDetailsSummary
        {...props}
        afterPillColors={afterPillColors}
        showAfterPill={showAfterPill}
      />
    </Box>
  )
}
