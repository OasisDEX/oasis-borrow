import type { IPosition } from '@oasisdex/dma-library'
import { getCurrentPositionLibCallData } from 'actions/aave-like/helpers'
import type BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { ContentCardLtv } from 'components/vault/detailsSection/ContentCardLtv'
import { SparkTokensBannerController } from 'features/aave/components/SparkTokensBannerController'
import { checkElligibleSparkPosition } from 'features/aave/helpers/eligible-spark-position'
import { mapStopLossFromLambda } from 'features/aave/manage/helpers/map-stop-loss-from-lambda'
import { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import type { TriggersAaveEvent, triggersAaveStateMachine } from 'features/aave/manage/state'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { ProductType, StrategyType } from 'features/aave/types'
import { StopLossTriggeredBanner } from 'features/automation/protection/stopLoss/controls/StopLossTriggeredBanner'
import {
  OmniCardDataLiquidationPriceModal,
  OmniCardDataPositionDebtModal,
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataBuyingPower,
  useOmniCardDataLiquidationPrice,
  useOmniCardDataMultiple,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { getOmniNetValuePnlData } from 'features/omni-kit/helpers'
import { useAaveCardDataNetValueLending } from 'features/omni-kit/protocols/aave/components/details-sections/parsers/useAaveCardDataNetValueLending'
import type { AaveCumulativeData } from 'features/omni-kit/protocols/aave/history/types'
import { LTVWarningThreshold } from 'features/omni-kit/protocols/ajna/constants'
import { OmniProductType } from 'features/omni-kit/types'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { NaNIsZero } from 'helpers/nanIsZero'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveData,
} from 'lendingProtocols/aave-like-common'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { bell } from 'theme/icons'
import { Grid } from 'theme-ui'
import type { Sender, StateFrom } from 'xstate'

import { CostToBorrowContentCardModal } from './CostToBorrowContentCard'

type AaveMultiplyPositionDataProps = {
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
  cumulatives?: AaveCumulativeData
  lendingProtocol: LendingProtocol
  productType: ProductType
  // triggersState is available _only_ in manage view (this component is used for both open and manage)
  triggersState?: StateFrom<typeof triggersAaveStateMachine>
  sendTriggerEvent?: Sender<TriggersAaveEvent>
}

export function AaveMultiplyPositionData({
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
  cumulatives,
  lendingProtocol,
  productType,
  triggersState,
}: AaveMultiplyPositionDataProps) {
  const { t } = useTranslation()
  const [collateralToken, debtToken] = getCurrentPositionLibCallData(currentPosition)
  const stopLossLambdaData = mapStopLossFromLambda(triggersState?.context.currentTriggers.triggers)
  const trailingStopLossLambdaData = mapTrailingStopLossFromLambda(
    triggersState?.context.currentTriggers.triggers,
  )
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
  const omniProduct = {
    [ProductType.Borrow]: OmniProductType.Borrow,
    [ProductType.Earn]: OmniProductType.Earn,
    [ProductType.Multiply]: OmniProductType.Multiply,
  }[productType]

  const nextNetValue = nextPositionThings
    ? getOmniNetValuePnlData({
        cumulatives,
        productType: omniProduct,
        collateralTokenPrice,
        debtTokenPrice,
        netValueInCollateralToken: nextPositionThings.netValueInCollateralToken,
        netValueInDebtToken: nextPositionThings.netValueInDebtToken,
        collateralToken: nextPosition.collateral.symbol,
        debtToken: nextPosition.debt.symbol,
      }).netValue.inUsd
    : undefined

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

  const netValueContentCardCommonData = useOmniCardDataNetValue({
    afterNetValue: nextNetValue,
    netValue: currentPositionThings.netValue,
  })

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

  const buyingPowerContentCardCommonData = useOmniCardDataBuyingPower({
    buyingPower: currentPositionThings.buyingPower,
    collateralPrice: collateralTokenPrice,
    collateralToken: collateralToken.symbol,
    afterBuyingPower: nextPositionThings?.buyingPower,
  })

  const multipleContentCardCommonData = useOmniCardDataMultiple({
    afterMultiple: nextPosition?.riskRatio.multiple,
    multiple: currentPosition.riskRatio.multiple,
  })

  const totalCollateralExposureContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: nextPositionThings?.collateral,
    tokensAmount: currentPositionThings.collateral,
    tokensSymbol: collateralToken.symbol,
    translationCardName: 'total-exposure',
  })

  const netValuePnlModalData = getOmniNetValuePnlData({
    cumulatives,
    productType: omniProduct,
    collateralTokenPrice,
    debtTokenPrice,
    netValueInCollateralToken: currentPositionThings.netValueInCollateralToken,
    netValueInDebtToken: currentPositionThings.netValueInDebtToken,
    collateralToken: currentPosition.collateral.symbol,
    debtToken: currentPosition.debt.symbol,
  })

  const netValueContentCardAaveData = useAaveCardDataNetValueLending(netValuePnlModalData)

  const automationData = useMemo(() => {
    if (trailingStopLossLambdaData.trailingStopLossTriggerName) {
      const collateral = amountFromWei(
        currentPosition.collateral.amount || zero,
        currentPosition.collateral.precision,
      )
      const debt = amountFromWei(
        currentPosition.debt.amount || zero,
        currentPosition.debt.precision,
      )
      const executionPrice = trailingStopLossLambdaData.dynamicParams.executionPrice
      return {
        isAutomationAvailable: true,
        stopLossLevel: debt.div(collateral.times(executionPrice)),
        isStopLossEnabled: true,
        isAutomationDataLoaded: true,
        isTrailingStopLoss: true,
      }
    }
    if (stopLossLambdaData.stopLossTriggerName) {
      return {
        isAutomationAvailable: true,
        stopLossLevel: stopLossLambdaData.stopLossLevel?.div(10 ** 2), // still needs to be divided by 100
        isStopLossEnabled: true,
        isAutomationDataLoaded: true,
      }
    }
    return {
      isAutomationAvailable,
      stopLossLevel,
      isStopLossEnabled,
      isAutomationDataLoaded,
    }
  }, [
    currentPosition.collateral.amount,
    currentPosition.collateral.precision,
    currentPosition.debt.amount,
    currentPosition.debt.precision,
    isAutomationAvailable,
    isAutomationDataLoaded,
    isStopLossEnabled,
    stopLossLambdaData.stopLossLevel,
    stopLossLambdaData.stopLossTriggerName,
    stopLossLevel,
    trailingStopLossLambdaData.dynamicParams?.executionPrice,
    trailingStopLossLambdaData.trailingStopLossTriggerName,
  ])

  const trailingStopLossnotifications = useMemo<DetailsSectionNotificationItem[]>(() => {
    if (trailingStopLossLambdaData.trailingStopLossTriggerName) {
      const { executionPrice, originalExecutionPrice } = trailingStopLossLambdaData.dynamicParams
      if (executionPrice.gt(originalExecutionPrice)) {
        return [
          {
            title: {
              translationKey: 'automation.trailing-stop-loss-execution-price-increased',
              params: {
                executionPrice: formatCryptoBalance(executionPrice),
                originalExecutionPrice: formatCryptoBalance(originalExecutionPrice),
                delta: `+${formatCryptoBalance(executionPrice.minus(originalExecutionPrice))} ${
                  currentPosition.debt.symbol
                }`,
                token: currentPosition.debt.symbol,
              },
            },
            sessionStorageParam: formatCryptoBalance(executionPrice),
            closable: true,
            icon: bell,
          },
        ]
      }
    }
    return []
  }, [
    currentPosition.debt.symbol,
    trailingStopLossLambdaData.dynamicParams,
    trailingStopLossLambdaData.trailingStopLossTriggerName,
  ])

  return (
    <Grid>
      {stopLossTriggered && (
        <StopLossTriggeredBanner descriptionKey="automation.trigger-executed-banner-short-description" />
      )}
      <DetailsSection
        title={t('system.overview')}
        notifications={[...trailingStopLossnotifications]}
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
              automation={automationData}
            />
            <OmniContentCard
              {...commonContentCardData}
              {...netValueContentCardCommonData}
              {...netValueContentCardAaveData}
            />
            <OmniContentCard {...commonContentCardData} {...buyingPowerContentCardCommonData} />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper columns={2}>
            <OmniContentCard asFooter {...totalCollateralExposureContentCardCommonData} />
            <OmniContentCard
              asFooter
              {...commonContentCardData}
              {...positionDebtContentCardCommonData}
            />
            <OmniContentCard
              asFooter
              {...commonContentCardData}
              {...multipleContentCardCommonData}
            />
            <OmniContentCard
              asFooter
              {...commonContentCardData}
              {...borrowRateContentCardCommonData}
              changeVariant={
                nextPositionThings?.netBorrowCostPercentage.lte(zero) ? 'positive' : 'negative'
              }
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      {isSparkPosition && isElligibleSparkPosition && <SparkTokensBannerController />}
    </Grid>
  )
}
