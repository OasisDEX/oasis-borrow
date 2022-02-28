import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { VaultDetailsCardCollateralLocked } from 'components/vault/detailsCards/VaultDetailsCardCollateralLocked'
import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import {
  AfterPillProps,
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { useHasChangedSinceFirstRender } from 'helpers/useHasChangedSinceFirstRender'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { VaultDetailsCardCollaterlizationRatioModal } from '../../../../components/vault/detailsCards/VaultDetailsCardCollaterlizationRatio'
import { VaultDetailsCardLiquidationPrice } from '../../../../components/vault/detailsCards/VaultDetailsCardLiquidationPrice'
import { OpenVaultState } from '../pipes/openVault'

function OpenVaultDetailsSummary({
  generateAmount,
  afterFreeCollateral,
  token,
  maxGenerateAmountCurrentPrice,
  afterPillColors,
  showAfterPill,
  relevant,
}: OpenVaultState & AfterPillProps & { relevant: boolean }) {
  const { t } = useTranslation()
  const { symbol } = getToken(token)

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
              {formatAmount(generateAmount || zero, 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-withdraw')}
        value={
          <>
            {formatAmount(zero, symbol)}
            {` ${symbol}`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterFreeCollateral.isNegative() ? zero : afterFreeCollateral, symbol)}
              {` ${symbol}`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-generate')}
        value={
          <>
            {formatAmount(zero, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(maxGenerateAmountCurrentPrice.minus(generateAmount || zero), 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}

export function OpenVaultDetails(props: OpenVaultState) {
  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    token,
    inputAmountsEmpty,
    stage,
  } = props
  const { t } = useTranslation()
  const openModal = useModal()

  // initial values only to show in UI as starting parameters
  const liquidationPrice = zero
  const collateralizationRatio = zero

  const afterDepositAmountUSD = props.depositAmountUSD
  const depositAmountUSD = zero
  const depositAmount = zero

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
  const inputAmountWasChanged = useHasChangedSinceFirstRender(inputAmountsEmpty)

  return (
    <>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCardLiquidationPrice
          {...{
            liquidationPrice,
            afterLiquidationPrice,
            afterPillColors,
            showAfterPill,
            relevant: inputAmountWasChanged,
          }}
        />

        <VaultDetailsCard
          title={`${t('system.collateralization-ratio')}`}
          value={formatPercent(collateralizationRatio.times(100), {
            precision: 2,
            roundMode: BigNumber.ROUND_DOWN,
          })}
          valueAfter={
            showAfterPill &&
            formatPercent(afterCollateralizationRatio.times(100), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })
          }
          openModal={() =>
            openModal(VaultDetailsCardCollaterlizationRatioModal, {
              currentCollateralRatio: collateralizationRatio,
              collateralRatioOnNextPrice: afterCollateralizationRatio,
            })
          }
          afterPillColors={afterPillColors}
          relevant={inputAmountWasChanged}
        />

        <VaultDetailsCardCurrentPrice {...props.priceInfo} />
        <VaultDetailsCardCollateralLocked
          {...{
            depositAmount,
            depositAmountUSD,
            afterDepositAmountUSD,
            token,
            afterPillColors,
            showAfterPill,
            relevant: inputAmountWasChanged,
          }}
        />
      </Grid>
      <OpenVaultDetailsSummary
        {...props}
        afterPillColors={afterPillColors}
        showAfterPill={showAfterPill}
        relevant={inputAmountWasChanged}
      />
    </>
  )
}
