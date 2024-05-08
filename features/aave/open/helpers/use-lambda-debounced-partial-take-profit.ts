import { getAddresses } from 'actions/aave-like/get-addresses'
import BigNumber from 'bignumber.js'
import type CancelablePromise from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { lambdaPriceDenomination } from 'features/aave/constants'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { StrategyType } from 'features/aave/types'
import type { SupportedLambdaProtocols } from 'helpers/lambda/triggers'
import type {
  ProfitsSimulationBalanceRaw,
  ProfitsSimulationMapped,
  SetupPartialTakeProfitResponse,
  TriggerAction,
  TriggersApiError,
  TriggersApiWarning,
} from 'helpers/lambda/triggers/setup-triggers'
import { setupLambdaPartialTakeProfit } from 'helpers/lambda/triggers/setup-triggers/setup-partial-take-profit'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useState } from 'react'

import { eth2weth } from '@oasisdex/utils/lib/src/utils'

type LambdaDebouncedPartialTakeProfitParams = (OpenAaveStateProps | ManageAaveStateProps) & {
  action: TriggerAction
  newStopLossAction: TriggerAction.Add | TriggerAction.Update
  newStopLossLtv?: BigNumber
  partialTakeProfitToken: string
  poolId?: string
  startingTakeProfitPrice: BigNumber
  transactionStep:
    | 'prepare'
    | 'preparedRemove'
    | 'addInProgress'
    | 'updateInProgress'
    | 'removeInProgress'
    | 'finished'
  triggerLtv: BigNumber
  withdrawalLtv: BigNumber
}

export const mapProfits = (
  simulation: SetupPartialTakeProfitResponse['simulation'],
  isShort: boolean,
): ProfitsSimulationMapped[] => {
  const parseProfitValue = (value: ProfitsSimulationBalanceRaw) => {
    return {
      balance: new BigNumber(value.balance).div(10 ** value.token.decimals),
      token: value.token,
    }
  }
  return simulation
    ? simulation.profits.map((sim) => {
        const triggerPrice = isShort
          ? new BigNumber(lambdaPriceDenomination).div(new BigNumber(sim.triggerPrice))
          : new BigNumber(sim.triggerPrice).div(lambdaPriceDenomination)
        const stopLossDynamicPrice = isShort
          ? new BigNumber(lambdaPriceDenomination).div(new BigNumber(sim.stopLossDynamicPrice))
          : new BigNumber(sim.stopLossDynamicPrice).div(lambdaPriceDenomination)
        return {
          triggerPrice,
          realizedProfitInCollateral: parseProfitValue(sim.realizedProfitInCollateral),
          realizedProfitInDebt: parseProfitValue(sim.realizedProfitInDebt),
          totalProfitInCollateral: parseProfitValue(sim.totalProfitInCollateral),
          totalProfitInDebt: parseProfitValue(sim.totalProfitInDebt),
          stopLossDynamicPrice,
          fee: parseProfitValue(sim.fee),
          totalFee: parseProfitValue(sim.totalFee),
        }
      })
    : []
}

export const useLambdaDebouncedPartialTakeProfit = ({
  action,
  newStopLossAction,
  newStopLossLtv,
  partialTakeProfitToken,
  poolId,
  send,
  startingTakeProfitPrice,
  state,
  transactionStep,
  triggerLtv,
  withdrawalLtv,
}: LambdaDebouncedPartialTakeProfitParams) => {
  const [isGettingPartialTakeProfitTx, setIsGettingPartialTakeProfitTx] = useState(false)
  const [warnings, setWarnings] = useState<TriggersApiWarning[]>([])
  const [errors, setErrors] = useState<TriggersApiError[]>([])
  const [partialTakeProfitTxCancelablePromise, setPartialTakeProfitTxCancelablePromise] =
    useState<CancelablePromise<SetupPartialTakeProfitResponse>>()
  const { strategyConfig } = state.context
  const { tokens } = getAddresses(strategyConfig.networkId, strategyConfig.protocol)
  const collateralAddress = tokens[eth2weth(state.context.tokens.collateral) as keyof typeof tokens]
  const debtAddress = tokens[eth2weth(state.context.tokens.debt) as keyof typeof tokens]

  const clearWarningsAndErrors = () => {
    setWarnings([])
    setErrors([])
  }

  const setProfits = (partialTakeProfitProfits: ProfitsSimulationMapped[] | undefined) => {
    send({
      type: 'SET_PARTIAL_TAKE_PROFIT_PROFITS_LAMBDA',
      partialTakeProfitProfits,
    })
  }
  const setFirstProfit = (partialTakeProfitFirstProfit: ProfitsSimulationMapped | undefined) => {
    send({
      type: 'SET_PARTIAL_TAKE_PROFIT_FIRST_PROFIT_LAMBDA',
      partialTakeProfitFirstProfit,
    })
  }

  useDebouncedEffect(
    () => {
      const { context } = state
      const dpmAccount = context.effectiveProxyAddress
      if (
        !['prepare', 'preparedRemove'].includes(transactionStep) ||
        !dpmAccount ||
        !collateralAddress ||
        !debtAddress ||
        !triggerLtv ||
        !withdrawalLtv ||
        !startingTakeProfitPrice ||
        !partialTakeProfitToken ||
        !action
      ) {
        return
      }
      if (!isGettingPartialTakeProfitTx) {
        setIsGettingPartialTakeProfitTx(true)
        clearWarningsAndErrors()
      }
      const isShort = strategyConfig.strategyType === StrategyType.Short
      const partialTakeProfitTxDataPromise = cancelable(
        setupLambdaPartialTakeProfit({
          action,
          dpm: dpmAccount,
          executionToken: partialTakeProfitToken === 'debt' ? debtAddress : collateralAddress,
          networkId: strategyConfig.networkId,
          poolId,
          protocol: strategyConfig.protocol as SupportedLambdaProtocols,
          strategy: {
            collateralAddress,
            debtAddress,
          },
          startingTakeProfitPrice: isShort
            ? new BigNumber(lambdaPriceDenomination).div(startingTakeProfitPrice)
            : startingTakeProfitPrice.times(lambdaPriceDenomination),
          stopLoss: newStopLossLtv
            ? {
                triggerData: {
                  executionLTV: newStopLossLtv,
                  token: partialTakeProfitToken === 'debt' ? debtAddress : collateralAddress,
                },
                action: newStopLossAction,
              }
            : undefined,
          triggerLtv,
          withdrawalLtv,
        }),
      )
      setProfits(undefined)

      setPartialTakeProfitTxCancelablePromise(partialTakeProfitTxDataPromise)
      partialTakeProfitTxDataPromise
        .then((res) => {
          if (res.transaction) {
            send({
              type: 'SET_PARTIAL_TAKE_PROFIT_TX_DATA_LAMBDA',
              partialTakeProfitTxDataLambda: {
                to: res.transaction.to,
                data: res.transaction.data,
              },
            })
          }
          if (res.simulation) {
            const profitsMapped = mapProfits(
              res.simulation,
              strategyConfig.strategyType === StrategyType.Short,
            )
            setProfits(profitsMapped)
            if (
              state.context.partialTakeProfitFirstProfit === undefined ||
              transactionStep === 'finished'
            ) {
              setFirstProfit(profitsMapped[0])
            }
          }
          res.warnings && setWarnings(res.warnings)
          res.errors && setErrors(res.errors)
        })
        .catch((error) => {
          send({
            type: 'TRANSACTION_FAILED',
            error,
          })
          send({
            type: 'SET_PARTIAL_TAKE_PROFIT_TX_DATA_LAMBDA',
            partialTakeProfitTxDataLambda: undefined,
          })
          setProfits(undefined)
        })
        .finally(() => {
          setIsGettingPartialTakeProfitTx(false)
        })
    },
    [
      triggerLtv,
      withdrawalLtv,
      newStopLossLtv,
      newStopLossAction,
      startingTakeProfitPrice,
      partialTakeProfitToken,
      action,
    ],
    500,
  )
  return {
    partialTakeProfitTxCancelablePromise,
    isGettingPartialTakeProfitTx,
    warnings,
    errors,
  }
}
