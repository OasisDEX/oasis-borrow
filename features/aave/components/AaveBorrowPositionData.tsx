import type { IPosition } from '@oasisdex/dma-library'
import { amountFromWei } from '@oasisdex/utils'
import { getCurrentPositionLibCallData } from 'actions/aave-like/helpers'
import type BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { ContentCardLtv } from 'components/vault/detailsSection/ContentCardLtv'
import { CostToBorrowContentCardModal } from 'features/aave/components/CostToBorrowContentCard'
import { SparkTokensBannerController } from 'features/aave/components/SparkTokensBannerController'
import { checkElligibleSparkPosition } from 'features/aave/helpers/eligible-spark-position'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { StrategyType } from 'features/aave/types'
import { StopLossTriggeredBanner } from 'features/automation/protection/stopLoss/controls/StopLossTriggeredBanner'
import {
  OmniCardDataAvailableToBorrow,
  OmniCardDataAvailableToWithdraw,
  OmniCardDataCollateralDepositedModal,
  OmniCardDataLiquidationPriceModal,
  OmniCardDataPositionDebtModal,
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataLiquidationPrice,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { getOmniNetValuePnlData } from 'features/omni-kit/helpers'
import type { AaveCumulativeData } from 'features/omni-kit/protocols/aave/history/types'
import { LTVWarningThreshold } from 'features/omni-kit/protocols/ajna/constants'
import { OmniProductType } from 'features/omni-kit/types'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { NaNIsZero } from 'helpers/nanIsZero'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveData,
} from 'lendingProtocols/aave-like-common'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

type AaveBorrowPositionDataProps = {
  currentPosition: IPosition
  nextPosition?: IPosition
  collateralTokenPrice: BigNumber
  debtTokenPrice: BigNumber
  collateralTokenReserveData: AaveLikeReserveData
  debtTokenReserveData: AaveLikeReserveData
  debtTokenReserveConfigurationData: AaveLikeReserveConfigurationData
  aaveHistory: VaultHistoryEvent[]
  isAutomationAvailable?: boolean
  strategyType: StrategyType
  lendingProtocol: LendingProtocol
  cumulatives?: AaveCumulativeData
}

export function AaveBorrowPositionData({
  currentPosition,
  nextPosition,
  collateralTokenPrice,
  debtTokenPrice,
  collateralTokenReserveData,
  debtTokenReserveData,
  debtTokenReserveConfigurationData,
  aaveHistory,
  isAutomationAvailable,
  strategyType,
  lendingProtocol,
  cumulatives,
}: AaveBorrowPositionDataProps) {
  const { t } = useTranslation()
  const [collateralToken, debtToken] = getCurrentPositionLibCallData(currentPosition)
  const {
    triggerData: {
      stopLossTriggerData: { stopLossLevel, isStopLossEnabled },
    },
    automationTriggersData: { isAutomationDataLoaded },
  } = useAutomationContext()
  const currentPositionThings = calculateViewValuesForPosition(
    currentPosition,
    collateralTokenPrice,
    debtTokenPrice,
    collateralTokenReserveData.liquidityRate,
    debtTokenReserveData.variableBorrowRate,
  )

  const nextPositionThings =
    nextPosition &&
    calculateViewValuesForPosition(
      nextPosition,
      collateralTokenPrice,
      debtTokenPrice,
      collateralTokenReserveData.liquidityRate,
      debtTokenReserveData.variableBorrowRate,
    )

  const stopLossTriggered =
    aaveHistory[0] &&
    'eventType' in aaveHistory[0] &&
    aaveHistory[0].eventType === 'executed' &&
    aaveHistory[0].autoKind === 'aave-stop-loss' &&
    currentPosition.debt.amount.isZero()

  const isSparkPosition = lendingProtocol === LendingProtocol.SparkV3
  const isElligibleSparkPosition = checkElligibleSparkPosition(
    collateralToken.symbol,
    debtToken.symbol,
  )

  const nextNetValue = nextPositionThings
    ? getOmniNetValuePnlData({
        cumulatives,
        productType: OmniProductType.Borrow,
        collateralTokenPrice,
        debtTokenPrice,
        netValueInCollateralToken: nextPositionThings.netValueInCollateralToken,
        netValueInDebtToken: nextPositionThings.netValueInDebtToken,
        collateralToken: nextPosition.collateral.symbol,
        debtToken: nextPosition.debt.symbol,
      }).netValue.inUsd
    : undefined

  const positionDebtContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: nextPositionThings?.debt,
    tokensAmount: currentPositionThings.debt,
    tokensPrice: debtTokenPrice,
    tokensSymbol: debtToken.symbol,
    translationCardName: 'position-debt',
    modal: (
      <OmniCardDataPositionDebtModal
        debtAmount={currentPositionThings.debt}
        quoteToken={debtToken.symbol}
      />
    ),
  })

  const changeVariant: ChangeVariantType = nextPosition
    ? nextPosition.category.maxLoanToValue
        .minus(nextPosition.riskRatio.loanToValue)
        .gt(LTVWarningThreshold)
      ? 'positive'
      : 'negative'
    : 'positive'

  const commonContentCardData = {
    changeVariant,
    isLoading: false,
  }

  const isShort = strategyType === StrategyType.Short
  const liquidationPrice = !isShort
    ? currentPositionThings.liquidationPriceInDebt
    : currentPositionThings.liquidationPriceInCollateral

  const afterLiquidationPrice = nextPositionThings
    ? !isShort
      ? nextPositionThings.liquidationPriceInDebt
      : nextPositionThings.liquidationPriceInCollateral
    : undefined

  const priceFormat = isShort
    ? `${debtToken.symbol}/${collateralToken.symbol}`
    : `${collateralToken.symbol}/${debtToken.symbol}`

  const belowCurrentPricePercentage = currentPositionThings.liquidationPriceInDebt
    .times(debtTokenPrice)
    .minus(collateralTokenPrice)
    .dividedBy(collateralTokenPrice)
    .absoluteValue()

  const aboveCurrentPricePercentage = currentPositionThings.liquidationPriceInCollateral
    .times(collateralTokenPrice)
    .minus(debtTokenPrice)
    .dividedBy(debtTokenPrice)
    .absoluteValue()

  const percentageDiff = isShort
    ? aboveCurrentPricePercentage.times(-1)
    : belowCurrentPricePercentage

  const liquidationPriceContentCardCommonData = useOmniCardDataLiquidationPrice({
    afterLiquidationPrice,
    liquidationPrice,
    unit: priceFormat,
    ratioToCurrentPrice: percentageDiff,
    modal: (
      <OmniCardDataLiquidationPriceModal
        liquidationPenalty={debtTokenReserveConfigurationData.liquidationBonus}
        liquidationPrice={liquidationPrice}
        priceFormat={priceFormat}
        ratioToCurrentPrice={percentageDiff}
      />
    ),
  })

  const collateralDepositedContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: nextPositionThings?.collateral,
    tokensAmount: currentPositionThings.collateral,
    tokensPrice: collateralTokenPrice,
    tokensSymbol: collateralToken.symbol,
    translationCardName: 'collateral-deposited',
    modal: (
      <OmniCardDataCollateralDepositedModal
        collateralAmount={currentPositionThings.collateral}
        collateralToken={collateralToken.symbol}
      />
    ),
  })

  const netValueContentCardCommonData = useOmniCardDataNetValue({
    afterNetValue: nextNetValue,
    netValue: currentPositionThings.netValue,
  })

  const borrowRateContentCardCommonData = useOmniCardDataBorrowRate({
    borrowRate: NaNIsZero(currentPositionThings.netBorrowCostPercentage),
    afterBorrowRate: nextPositionThings?.netBorrowCostPercentage,
    modal: (
      <CostToBorrowContentCardModal
        currentPositionThings={currentPositionThings}
        debtTokenPrice={debtTokenPrice}
        position={currentPosition}
      />
    ),
  })
  const maxCollateralToWithdraw = amountFromWei(
    currentPosition.maxCollateralToWithdraw,
    collateralToken.precision,
  )
  const resolvedMaxCollateralToWithdraw = maxCollateralToWithdraw.isNaN()
    ? zero
    : maxCollateralToWithdraw

  const availableToWithdrawContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: nextPosition
      ? amountFromWei(nextPosition?.maxCollateralToWithdraw, collateralToken.precision)
      : undefined,
    tokensAmount: resolvedMaxCollateralToWithdraw,
    tokensSymbol: collateralToken.symbol,
    translationCardName: 'available-to-withdraw',
    modal: (
      <OmniCardDataAvailableToWithdraw
        availableToWithdraw={resolvedMaxCollateralToWithdraw}
        tokenSymbol={collateralToken.symbol}
      />
    ),
  })

  const maxDebtToBorrow = amountFromWei(currentPosition.maxDebtToBorrow, debtToken.precision)

  const availableToBorrowContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: nextPosition
      ? amountFromWei(nextPosition?.maxDebtToBorrow, debtToken.precision)
      : undefined,
    tokensAmount: maxDebtToBorrow,
    tokensSymbol: debtToken.symbol,
    translationCardName: 'available-to-borrow',
    modal: (
      <OmniCardDataAvailableToBorrow
        availableToBorrow={maxDebtToBorrow}
        quoteToken={debtToken.symbol}
      />
    ),
  })

  return (
    <Grid>
      {stopLossTriggered && (
        <StopLossTriggeredBanner descriptionKey="automation.trigger-executed-banner-short-description" />
      )}
      <DetailsSection
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <OmniContentCard
              {...commonContentCardData}
              {...liquidationPriceContentCardCommonData}
            />
            <ContentCardLtv
              loanToValue={currentPosition.riskRatio.loanToValue}
              liquidationThreshold={currentPosition.category.liquidationThreshold}
              afterLoanToValue={nextPosition?.riskRatio.loanToValue}
              maxLoanToValue={nextPosition?.category.maxLoanToValue}
              automation={{
                isAutomationAvailable,
                isAutomationDataLoaded,
                isStopLossEnabled,
                stopLossLevel,
              }}
            />
            <OmniContentCard
              {...commonContentCardData}
              {...collateralDepositedContentCardCommonData}
            />
            <OmniContentCard {...commonContentCardData} {...positionDebtContentCardCommonData} />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper columns={2}>
            <OmniContentCard
              asFooter
              {...commonContentCardData}
              {...borrowRateContentCardCommonData}
              changeVariant={
                nextPositionThings?.netBorrowCostPercentage.lte(zero) ? 'positive' : 'negative'
              }
            />
            <OmniContentCard
              asFooter
              {...commonContentCardData}
              {...netValueContentCardCommonData}
            />
            <OmniContentCard
              asFooter
              {...commonContentCardData}
              {...availableToWithdrawContentCardCommonData}
            />
            <OmniContentCard
              asFooter
              {...commonContentCardData}
              {...availableToBorrowContentCardCommonData}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      {isSparkPosition && isElligibleSparkPosition && <SparkTokensBannerController />}
    </Grid>
  )
}
