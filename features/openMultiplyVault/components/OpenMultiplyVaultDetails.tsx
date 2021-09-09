import {
  AfterPillProps,
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsBuyingPowerModal,
  VaultDetailsCard,
  VaultDetailsCardCurrentPrice,
  VaultDetailsCardLiquidationPrice,
  VaultDetailsNetValueModal,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { OpenMultiplyVaultState } from '../openMultiplyVault'

function OpenMultiplyVaultDetailsSummary({
  token,
  afterPillColors,
  showAfterPill,
  afterOutstandingDebt,
  multiply,
  totalExposure,
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
        label={t('system.total-exposure', { token })}
        value={
          <>
            {formatCryptoBalance(totalExposure || zero)} {token}
          </>
        }
      />
      <VaultDetailsSummaryItem
        label={t('system.multiply')}
        value={
          <>
            {multiply?.toFixed(2)}
            {t('system.multiplier-exposure')}
          </>
        }
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
    multiply,
    totalExposure,
  } = props
  const openModal = useModal()

  // initial values only to show in UI as starting parameters
  const liquidationPrice = zero
  const buyingPowerUSD = zero
  const buyingPower = zero
  const netValueUSD = zero

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'openSuccess'
  console.log('propsy')
  console.log(props)
  console.log(multiply)
  console.log(totalExposure)
  return (
    <>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCardLiquidationPrice
          {...{
            liquidationPrice,
            afterLiquidationPrice,
            afterPillColors,
            showAfterPill,
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

        <VaultDetailsCardCurrentPrice {...props} />

        <VaultDetailsCard
          title={`Net Value`}
          value={`$${formatAmount(netValueUSD, 'USD')}`}
          valueBottom={`Unrealised P&L 0%`}
          valueAfter={showAfterPill && `$${formatAmount(afterNetValueUSD, 'USD')}`}
          openModal={() => openModal(VaultDetailsNetValueModal)}
          afterPillColors={afterPillColors}
        />
      </Grid>
      <OpenMultiplyVaultDetailsSummary
        {...props}
        afterPillColors={afterPillColors}
        showAfterPill={showAfterPill}
      />
    </>
  )
}
