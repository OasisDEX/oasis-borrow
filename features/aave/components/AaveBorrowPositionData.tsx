import type { IPosition } from '@oasisdex/dma-library'
import { getCurrentPositionLibCallData } from 'actions/aave-like/helpers'
import type BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { ContentCardLiquidationPriceV2 } from 'components/vault/detailsSection/ContentCardLiquidationPriceV2'
import { ContentCardLtv } from 'components/vault/detailsSection/ContentCardLtv'
import { SparkTokensBannerController } from 'features/aave/components/SparkTokensBannerController'
import { calculateViewValuesForPosition } from 'features/aave/services'
import { StrategyType } from 'features/aave/types'
import { StopLossTriggeredBanner } from 'features/automation/protection/stopLoss/controls/StopLossTriggeredBanner'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { formatAmount, formatPrecision } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveData,
} from 'lendingProtocols/aave-like-common'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { CostToBorrowContentCard } from './CostToBorrowContentCard'
import { NetValueCard } from './NetValueCard'

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

  return (
    <Grid>
      {stopLossTriggered && (
        <StopLossTriggeredBanner descriptionKey="automation.trigger-executed-banner-short-description" />
      )}
      <DetailsSection
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardLiquidationPriceV2
              liquidationPriceInDebt={currentPositionThings.liquidationPriceInDebt}
              afterLiquidationPriceInDebt={nextPositionThings?.liquidationPriceInDebt}
              liquidationPriceInCollateral={currentPositionThings.liquidationPriceInCollateral}
              afterLiquidationPriceInCollateral={nextPositionThings?.liquidationPriceInCollateral}
              collateralPrice={collateralTokenPrice}
              quotePrice={debtTokenPrice}
              collateralToken={currentPosition.collateral.symbol}
              quoteToken={currentPosition.debt.symbol}
              isShort={strategyType === StrategyType.Short}
              liquidationPenalty={debtTokenReserveConfigurationData.liquidationBonus}
            />
            <ContentCardLtv
              loanToValue={currentPosition.riskRatio.loanToValue}
              liquidationThreshold={currentPosition.category.liquidationThreshold}
              afterLoanToValue={nextPosition?.riskRatio.loanToValue}
              maxLoanToValue={currentPosition.category.maxLoanToValue}
              automation={{
                isAutomationAvailable,
                isAutomationDataLoaded,
                isStopLossEnabled,
                stopLossLevel,
              }}
            />
            <CostToBorrowContentCard
              position={currentPosition}
              currentPositionThings={currentPositionThings}
              nextPositionThings={nextPositionThings}
              debtTokenPrice={debtTokenPrice}
            />
            <NetValueCard
              strategyType={strategyType}
              currentPositionThings={currentPositionThings}
              currentPosition={currentPosition}
              nextPositionThings={nextPositionThings}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper columns={2}>
            <DetailsSectionFooterItem
              sx={{ pr: 3 }}
              title={t('system.total-exposure', { token: collateralToken.symbol })}
              value={`${formatAmount(
                currentPositionThings.totalExposure,
                collateralToken.symbol,
              )} ${collateralToken.symbol}`}
              change={
                nextPositionThings && {
                  variant: nextPositionThings.totalExposure.gt(currentPositionThings.totalExposure)
                    ? 'positive'
                    : 'negative',
                  value: `${formatAmount(
                    nextPositionThings.totalExposure,
                    collateralToken.symbol,
                  )} ${collateralToken.symbol} ${t('after')}`,
                }
              }
            />
            <DetailsSectionFooterItem
              sx={{ pr: 3 }}
              title={t('system.position-debt')}
              value={`${formatPrecision(currentPositionThings.debt, 4)} ${debtToken.symbol}`}
              change={
                nextPositionThings && {
                  variant: nextPositionThings.debt.gt(currentPositionThings.debt)
                    ? 'positive'
                    : 'negative',
                  value: `${formatPrecision(
                    nextPositionThings.debt.lt(zero) ? zero : nextPositionThings.debt,
                    4,
                  )} ${nextPosition.debt.symbol} ${t('after')}`,
                }
              }
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <SparkTokensBannerController />
    </Grid>
  )
}
