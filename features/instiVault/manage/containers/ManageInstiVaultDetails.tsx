import React from 'react'
import { Box, Grid, Text } from 'theme-ui'
import { 
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCardCollateralLocked,
  VaultDetailsCardCollateralizationRatio,
  VaultDetailsCardCurrentPrice,
  VaultDetailsCard 
} from 'components/vault/VaultDetails'
import { ManageVaultDetailsSummary } from 'features/borrow/manage/containers/ManageVaultDetails'
import { useTranslation } from 'next-i18next'
import { formatAmount, formatPercent, formatRatio } from 'helpers/formatters/format'
import { BigNumber } from 'bignumber.js'
import { ManageInstiVaultState } from '../pipes/manageVault'


export function ManageInstiVaultDetails(props: ManageInstiVaultState) {
  const {
    vault: {
      token,
      lockedCollateral,
      lockedCollateralUSD,
    },
    afterCollateralizationRatio,
    afterLockedCollateralUSD,
    inputAmountsEmpty,
    stage,
    activeCollRatio,

    activeCollRatioPriceUSD,
    debtCeiling,
    termEnd,
    fixedFee,
    nextFixedFee
  } = props
  const { t } = useTranslation()
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPill = {
    afterPillColors: getAfterPillColors(afterCollRatioColor),
    showAfterPill: !inputAmountsEmpty && stage !== 'manageSuccess' ,
  }
  return (
    <Box>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCard
          title={t('manage-insti-vault.card.min-active-coll-ratio-price')}
          value={`$${formatAmount(activeCollRatioPriceUSD, 'USD')}`}
          valueBottom={t('manage-insti-vault.card.min-active-coll-ratio', { percentageRatio: 
            formatRatio(activeCollRatio)})}
          {...afterPill}
        />
        <VaultDetailsCardCollateralizationRatio 
          {...props}
          {...afterPill}
        />
        <VaultDetailsCardCurrentPrice {...props} />
        <VaultDetailsCardCollateralLocked
          depositAmountUSD={lockedCollateralUSD}
          afterDepositAmountUSD={afterLockedCollateralUSD}
          depositAmount={lockedCollateral}
          token={token}
          {...afterPill}
        />
        <VaultDetailsCard
          title={t('manage-insti-vault.card.current-fixed-fee')}
          value={formatRatio(fixedFee)}
          valueBottom={
            <>
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                {t('manage-insti-vault.card.next-fee-change')}{' '}
              </Text>
              {formatRatio(nextFixedFee)}
            </>
          }
          {...afterPill}
        />
      </Grid>
      <ManageVaultDetailsSummary
        {...props}
        {...afterPill}
      />
    </Box>
  )
}
