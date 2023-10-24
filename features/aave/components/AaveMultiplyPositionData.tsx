import type { IPosition } from '@oasisdex/dma-library'
import { getCurrentPositionLibCallData } from 'actions/aave-like/helpers'
import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { ContentCardLtv } from 'components/vault/detailsSection/ContentCardLtv'
import { calculateViewValuesForPosition } from 'features/aave/services'
import type { StrategyType } from 'features/aave/types'
import { StopLossTriggeredBanner } from 'features/automation/protection/stopLoss/controls/StopLossTriggeredBanner'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { displayMultiple } from 'helpers/display-multiple'
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
import { LiquidationPriceCard } from './LiquidationPriceCard'
import { NetValueCard } from './NetValueCard'

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
}: AaveMultiplyPositionDataProps) {
  const { t } = useTranslation()
  const [collateralToken, debtToken] = getCurrentPositionLibCallData(currentPosition)

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
            <LiquidationPriceCard
              currentPositionThings={currentPositionThings}
              position={currentPosition}
              strategyType={strategyType}
              nextPositionThings={nextPositionThings}
              collateralTokenPrice={collateralTokenPrice}
              debtTokenPrice={debtTokenPrice}
              collateralTokenReserveData={collateralTokenReserveData}
              debtTokenReserveData={debtTokenReserveData}
              debtTokenReserveConfigurationData={debtTokenReserveConfigurationData}
            />
            <ContentCardLtv
              loanToValue={currentPosition.riskRatio.loanToValue}
              liquidationThreshold={currentPosition.category.liquidationThreshold}
              afterLoanToValue={nextPosition?.riskRatio.loanToValue}
              maxLoanToValue={currentPosition.category.maxLoanToValue}
              isAutomationAvailable={isAutomationAvailable}
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
            <DetailsSectionFooterItem
              sx={{ pr: 3 }}
              title={t('system.multiple')}
              value={displayMultiple(currentPosition.riskRatio.multiple)}
              change={
                nextPosition && {
                  variant: nextPosition.riskRatio.multiple.gt(currentPosition.riskRatio.multiple)
                    ? 'positive'
                    : 'negative',
                  value: `${nextPosition.riskRatio.multiple.toFormat(1, BigNumber.ROUND_DOWN)}x ${t(
                    'after',
                  )}`,
                }
              }
            />
            <DetailsSectionFooterItem
              sx={{ pr: 3 }}
              title={t('system.buying-power')}
              value={`${formatPrecision(currentPositionThings.buyingPower, 2)} USD`}
              change={
                nextPositionThings && {
                  variant: nextPositionThings.buyingPower.gt(currentPositionThings.buyingPower)
                    ? 'positive'
                    : 'negative',
                  value: `${formatPrecision(nextPositionThings.buyingPower, 2)} USD ${t('after')}`,
                }
              }
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
    </Grid>
  )
}
