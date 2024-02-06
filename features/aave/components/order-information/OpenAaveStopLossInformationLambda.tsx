import type { IStrategy } from '@oasisdex/dma-library'
import { amountFromWei } from '@oasisdex/utils'
import type BigNumber from 'bignumber.js'
import type { Tickers } from 'blockchain/prices.types'
import { DimmedList } from 'components/DImmedList'
import { OpenFlowStopLossSummary } from 'components/OpenFlowStopLossSummary'
import { StopLossCommonOrderInformationLambda } from 'features/aave/components/order-information/StopLossCommonOrderInformationLambda'
import type { IStrategyInfo } from 'features/aave/types'
import {
  getDynamicStopLossPrice,
  getMaxToken,
} from 'features/automation/protection/stopLoss/helpers'
import { zero } from 'helpers/zero'
import React from 'react'

interface OpenAaveStopLossInformationLambdaProps {
  stopLossLevel: BigNumber
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  transition?: IStrategy
  collateralActive: boolean
  strategyInfo?: IStrategyInfo
  tokensPriceData?: Tickers
}

export function OpenAaveStopLossInformationLambda({
  transition,
  stopLossLevel,
  collateralActive,
  liquidationPrice,
  liquidationRatio,
  strategyInfo,
  tokensPriceData,
}: OpenAaveStopLossInformationLambdaProps) {
  const lockedCollateral = amountFromWei(
    transition?.simulation.position.collateral.amount || zero,
    transition?.simulation.position.collateral.precision,
  )
  const debt = amountFromWei(
    transition?.simulation.position.debt.amount || zero,
    transition?.simulation.position.debt.precision,
  )
  const triggerMaxToken = getMaxToken({
    stopLossLevel,
    lockedCollateral,
    liquidationRatio,
    liquidationPrice,
    debt,
  })

  const dynamicStopLossPrice = getDynamicStopLossPrice({
    stopLossLevel,
    liquidationRatio,
    liquidationPrice,
  })

  return (
    <DimmedList>
      <OpenFlowStopLossSummary
        stopLossLevel={stopLossLevel}
        dynamicStopLossPrice={dynamicStopLossPrice}
        ratioTranslationKey="protection.stop-loss-ltv"
      />
      <StopLossCommonOrderInformationLambda
        lockedCollateral={lockedCollateral}
        debt={debt}
        liquidationPrice={liquidationPrice}
        strategyInfo={strategyInfo}
        afterMaxToken={triggerMaxToken}
        isCollateralActive={collateralActive}
        executionPrice={dynamicStopLossPrice}
        tokensPriceData={tokensPriceData}
      />
    </DimmedList>
  )
}
