import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import {
  AfterPillProps,
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsCardCollateralLocked,
  VaultDetailsCardCollaterlizationRatioModal,
  VaultDetailsCardCurrentPrice,
  VaultDetailsCardLiquidationPrice,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { usePresenter } from 'helpers/usePresenter'
import { zero } from 'helpers/zero'
import { memoize } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Observable } from 'rxjs'
import { map, scan } from 'rxjs/operators'
import { Grid } from 'theme-ui'

import { OpenVaultStage, OpenVaultState } from '../openVault'

type OpenVaultDetailsSummaryProps = {
  generateAmount?: BigNumber
  afterFreeCollateral: BigNumber
  token: string
  maxGenerateAmountCurrentPrice: BigNumber
}

function OpenVaultDetailsSummary({
  generateAmount,
  afterFreeCollateral,
  token,
  maxGenerateAmountCurrentPrice,
  afterPillColors,
  showAfterPill,
  relevant,
}: OpenVaultDetailsSummaryProps & AfterPillProps & { relevant: boolean }) {
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

type OpenVaultDetailsViewData = {
  afterCollateralizationRatio: BigNumber
  afterLiquidationPrice: BigNumber
  token: string
  inputAmountsEmpty: boolean
  stage: OpenVaultStage
  afterDepositAmountUSD?: BigNumber
  ilkData: IlkData
  currentCollateralPrice: BigNumber
  nextCollateralPrice: BigNumber
  isStaticCollateralPrice: boolean
  collateralPricePercentageChange: BigNumber
  generateAmount?: BigNumber
  afterFreeCollateral: BigNumber
  maxGenerateAmountCurrentPrice: BigNumber
  inputAmountWasChanged: boolean
}

const presenter = memoize(
  (openVault$: Observable<OpenVaultState>): Observable<OpenVaultDetailsViewData> =>
    openVault$.pipe(
      map((openVaultState) => {
        return {
          afterCollateralizationRatio: openVaultState.afterCollateralizationRatio,
          afterLiquidationPrice: openVaultState.afterLiquidationPrice,
          token: openVaultState.token,
          inputAmountsEmpty: openVaultState.inputAmountsEmpty,
          stage: openVaultState.stage,
          afterDepositAmountUSD: openVaultState.depositAmountUSD,
          ilkData: openVaultState.ilkData,
          currentCollateralPrice: openVaultState.priceInfo.currentCollateralPrice,
          nextCollateralPrice: openVaultState.priceInfo.nextCollateralPrice,
          isStaticCollateralPrice: openVaultState.priceInfo.isStaticCollateralPrice,
          collateralPricePercentageChange: openVaultState.priceInfo.collateralPricePercentageChange,
          generateAmount: openVaultState.generateAmount,
          afterFreeCollateral: openVaultState.afterFreeCollateral,
          maxGenerateAmountCurrentPrice: openVaultState.maxGenerateAmountCurrentPrice,
          inputAmountWasChanged: !openVaultState.inputAmountsEmpty,
        }
      }),
      scan((acc, cur) => ({
        ...cur,
        inputAmountWasChanged: acc.inputAmountWasChanged || cur.inputAmountWasChanged,
      })),
    ),
)

export function OpenVaultDetails(props: { ilk: string }) {
  const { t } = useTranslation()
  const openModal = useModal()
  const viewData = usePresenter((appContext) => appContext.openVault$(props.ilk), presenter)
  if (!viewData) return null

  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    token,
    inputAmountsEmpty,
    stage,
    afterDepositAmountUSD,
    ilkData,
    currentCollateralPrice,
    nextCollateralPrice,
    isStaticCollateralPrice,
    collateralPricePercentageChange,
    generateAmount,
    afterFreeCollateral,
    maxGenerateAmountCurrentPrice,
    inputAmountWasChanged,
  } = viewData

  // initial values only to show in UI as starting parameters
  const liquidationPrice = zero
  const collateralizationRatio = zero

  const depositAmountUSD = zero
  const depositAmount = zero

  const afterCollRatioColor = getCollRatioColor(
    { inputAmountsEmpty, ilkData },
    afterCollateralizationRatio,
  )
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'

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

        <VaultDetailsCardCurrentPrice
          {...{
            currentCollateralPrice,
            nextCollateralPrice,
            isStaticCollateralPrice,
            collateralPricePercentageChange,
          }}
        />
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
        {...{
          generateAmount,
          afterFreeCollateral,
          token,
          maxGenerateAmountCurrentPrice,
          afterPillColors,
          showAfterPill,
          relevant: inputAmountWasChanged,
        }}
      />
    </>
  )
}
