import { VaultDetailsCardCollateralLocked } from 'components/vault/detailsCards/VaultDetailsCardCollateralLocked'
import { VaultDetailsCardCollateralizationRatio } from 'components/vault/detailsCards/VaultDetailsCardCollaterlizationRatio'
import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import {
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCard,
} from 'components/vault/VaultDetails'
import { ManageVaultDetailsSummary } from 'features/borrow/manage/containers/ManageVaultDetails'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { ManageInstiVaultState } from '../../../borrow/manage/pipes/manageVault'

export function ManageInstiVaultDetails(props: ManageInstiVaultState) {
  const {
    vault: { token, lockedCollateral, lockedCollateralUSD },
    afterCollateralizationRatio,
    afterLockedCollateralUSD,
    inputAmountsEmpty,
    stage,
    vault: { activeCollRatio, activeCollRatioPriceUSD, termEnd, fixedFee, nextFixedFee },
  } = props
  const { t } = useTranslation()
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPill = {
    afterPillColors: getAfterPillColors(afterCollRatioColor),
    showAfterPill: !inputAmountsEmpty && stage !== 'manageSuccess',
  }
  return (
    <Box>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCard
          title={t('manage-insti-vault.card.min-active-coll-ratio-price')}
          value={`$${formatAmount(activeCollRatioPriceUSD, 'USD')}`}
          valueBottom={t('manage-insti-vault.card.min-active-coll-ratio', {
            percentageRatio: formatDecimalAsPercent(activeCollRatio),
          })}
          {...afterPill}
        />
        <VaultDetailsCardCollateralizationRatio {...props} {...afterPill} />
        <VaultDetailsCardCurrentPrice {...props.priceInfo} />
        <VaultDetailsCardCollateralLocked
          depositAmountUSD={lockedCollateralUSD}
          afterDepositAmountUSD={afterLockedCollateralUSD}
          depositAmount={lockedCollateral}
          token={token}
          {...afterPill}
        />
        <VaultDetailsCard
          title={t('manage-insti-vault.card.current-fixed-fee')}
          value={formatDecimalAsPercent(fixedFee)}
          valueBottom={
            <>
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                {t('manage-insti-vault.card.next-fee-change')}{' '}
              </Text>
              {formatDecimalAsPercent(nextFixedFee)}
            </>
          }
          {...afterPill}
        />
        <VaultDetailsCard
          title={t('manage-insti-vault.card.term-end')}
          value={moment(termEnd).format('Do MMMM YYYY')}
          valueBottom={t('manage-insti-vault.card.days-remaining', {
            days: moment(termEnd).diff(moment(), 'days'),
          })}
          {...afterPill}
        />
      </Grid>
      <ManageVaultDetailsSummary {...props} {...afterPill} />
    </Box>
  )
}
