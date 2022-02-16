import React from 'react'
import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'
import { Box, Grid } from 'theme-ui'
import { 
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCardCollateralLocked,
  VaultDetailsCardCollateralizationRatio,
  VaultDetailsCardCurrentPrice,
  VaultDetailsCard 
} from 'components/vault/VaultDetails'
import { ManageVaultDetailsSummary } from 'features/borrow/manage/containers/ManageVaultDetails'
import t from 'pages/api/t'
import { useTranslation } from 'next-i18next'
import { formatPercent } from 'helpers/formatters/format'
import { BigNumber } from 'bignumber.js'


export function ManageInstiVaultDetails(props: ManageVaultState & {activeCollRatio: BigNumber }) {
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
    activeCollRatio
  } = props
  const { t } = useTranslation()
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  
  return (
    <Box>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCard
          title={t('manage-insti-vault.card.min-active-coll-ratio-price')}
          value="todo"
          valueBottom={t('min-active-coll-ratio', { percentageRatio: 
            formatPercent(activeCollRatio.times(100), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })})}
          afterPillColors={afterPillColors} 
          showAfterPill={showAfterPill}
        />
        <VaultDetailsCardCollateralizationRatio 
          afterPillColors={afterPillColors} 
          showAfterPill={showAfterPill}
          {...props}
        />
        <VaultDetailsCardCurrentPrice {...props} />
        <VaultDetailsCardCollateralLocked
          depositAmountUSD={lockedCollateralUSD}
          afterDepositAmountUSD={afterLockedCollateralUSD}
          depositAmount={lockedCollateral}
          token={token}
          afterPillColors={afterPillColors}
          showAfterPill={showAfterPill}
        />
      </Grid>
      <ManageVaultDetailsSummary
        {...props}
        afterPillColors={afterPillColors}
        showAfterPill={showAfterPill}
      />
    </Box>
  )
}
