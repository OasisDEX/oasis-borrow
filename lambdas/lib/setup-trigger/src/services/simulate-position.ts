import { adjustToTargetRiskRatio, RISK_RATIO_CTOR_TYPE, RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import {
  LTV,
  MULTIPLY_DECIMALS,
  ONE_PERCENT,
  PERCENT_DECIMALS,
  PositionLike,
  Price,
  PRICE_DECIMALS,
} from '~types'
import { Logger } from '@aws-lambda-powertools/logger'

export interface SimulatedPosition {
  targetLTV: LTV
  targetMultiple: bigint
  executionLTV: LTV
  targetLTVWithDeviation: [LTV, LTV]
  collateralAmountAfterExecution: bigint
  debtAmountAfterExecution: bigint
}

export interface SimulatePositionParams {
  position: PositionLike
  targetLTV: LTV
  executionLTV: LTV
  executionPrice: Price
}

export function simulatePosition(
  { position, targetLTV, executionPrice, executionLTV }: SimulatePositionParams,
  logger?: Logger,
): SimulatedPosition {
  logger?.debug('Position to simulate', {
    position: position,
    executionPrice: executionPrice,
    executionLTV: executionLTV,
    targetLTV,
  })

  const denominatedPrice = new BigNumber(executionPrice.toString()).div(
    (10n ** PRICE_DECIMALS).toString(),
  )
  const denominatedExecutionLTV = new BigNumber(executionLTV.toString()).div(
    (10n ** PERCENT_DECIMALS).toString(),
  )
  const denominatedTargetLTV = new BigNumber(targetLTV.toString()).div(
    (10n ** PERCENT_DECIMALS).toString(),
  )
  const result = adjustToTargetRiskRatio(
    {
      collateral: {
        amount: new BigNumber(position.collateral.balance.toString()),
        symbol: position.collateral.token.symbol,
        precision: position.collateral.token.decimals,
      },
      debt: {
        amount: new BigNumber(position.debt.balance.toString()),
        symbol: position.debt.token.symbol,
        precision: position.debt.token.decimals,
      },
      // @ts-ignore
      riskRatio: new RiskRatio(denominatedExecutionLTV, 'LTV'),
    },
    // @ts-ignore
    new RiskRatio(denominatedTargetLTV, 'LTV'),
    {
      fees: {
        oazo: new BigNumber(0.01),
        flashLoan: new BigNumber(0),
      },
      slippage: new BigNumber(0.01),
      prices: {
        oracle: denominatedPrice,
        market: denominatedPrice,
      },
      options: {
        isFlashloanRequired: true,
        collectSwapFeeFrom: 'sourceToken',
      },
      toDeposit: {
        debt: new BigNumber(0),
        collateral: new BigNumber(0),
      },
    },
  )

  const collateralAmountAfterBuy = BigInt(result.position.collateral.amount.abs().toString())
  const debtAmountAfterBuy = BigInt(result.position.debt.amount.toString())
  const calculatedTargetLTV = BigInt(
    result.position.riskRatio.loanToValue.times(10_000).integerValue().toNumber(),
  )

  logger?.debug('Current collateral amount', { collateral: position.collateral.balance })
  logger?.debug('Collateral after execution', { collateral: result.position.collateral.amount })
  logger?.debug('Debt after execution', { debt: result.position.debt.amount })
  logger?.debug('Target LTV after execution', { ltv: result.position.riskRatio.loanToValue })
  logger?.debug('Multiple after execution', { multiple: result.position.riskRatio.multiple })

  return {
    executionLTV,
    targetLTV: calculatedTargetLTV,
    collateralAmountAfterExecution: collateralAmountAfterBuy,
    debtAmountAfterExecution: debtAmountAfterBuy,
    targetLTVWithDeviation: [calculatedTargetLTV - ONE_PERCENT, calculatedTargetLTV + ONE_PERCENT],
    targetMultiple: BigInt(
      result.position.riskRatio.multiple
        .times((10n ** MULTIPLY_DECIMALS).toString())
        .integerValue()
        .toString(),
    ),
  }
}
