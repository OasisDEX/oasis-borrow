import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import { VaultDetailsCardNetValue } from 'components/vault/detailsCards/VaultDetailsCardNetValue'
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

import { VaultDetailsBuyingPowerModal } from '../../../../components/vault/detailsCards/VaultDetailsBuyingPower'
import { VaultDetailsCardLiquidationPrice } from '../../../../components/vault/detailsCards/VaultDetailsCardLiquidationPrice'
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
    id,
    ilkData: { liquidationRatio },
  } = props
  const openModal = useModal()

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

  return (
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
            vaultId: id!,
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
  )
}
