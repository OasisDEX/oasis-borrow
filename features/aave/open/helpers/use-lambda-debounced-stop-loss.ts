import { getAddresses } from 'actions/aave-like/get-addresses'
import type BigNumber from 'bignumber.js'
import type CancelablePromise from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import type { SupportedLambdaProtocols } from 'helpers/lambda/triggers'
import type {
  SetupBasicStopLossResponse,
  TriggerAction,
  TriggersApiError,
  TriggersApiWarning,
} from 'helpers/lambda/triggers/setup-triggers'
import { setupStopLoss } from 'helpers/lambda/triggers/setup-triggers'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useState } from 'react'

import { eth2weth } from '@oasisdex/utils/lib/src/utils'

type LambdaDebouncedStopLossParams = (OpenAaveStateProps | ManageAaveStateProps) & {
  action: TriggerAction
  poolId?: string
  stopLossLevel: BigNumber
  stopLossToken: string
}

export const useLambdaDebouncedStopLoss = ({
  action,
  poolId,
  send,
  state,
  stopLossLevel,
  stopLossToken,
}: LambdaDebouncedStopLossParams) => {
  const [isGettingStopLossTx, setIsGettingStopLossTx] = useState(false)
  const [warnings, setWarnings] = useState<TriggersApiWarning[]>([])
  const [errors, setErrors] = useState<TriggersApiError[]>([])
  const [stopLossTxCancelablePromise, setStopLossTxCancelablePromise] =
    useState<CancelablePromise<SetupBasicStopLossResponse>>()
  const { strategyConfig } = state.context
  const { tokens } = getAddresses(strategyConfig.networkId, strategyConfig.protocol)
  const collateralAddress = tokens[eth2weth(state.context.tokens.collateral) as keyof typeof tokens]
  const debtAddress = tokens[eth2weth(state.context.tokens.debt) as keyof typeof tokens]

  const clearWarningsAndErrors = () => {
    setWarnings([])
    setErrors([])
  }

  useDebouncedEffect(
    () => {
      const { context } = state
      const dpmAccount = context.effectiveProxyAddress
      if (!dpmAccount || !stopLossLevel || !collateralAddress || !debtAddress) {
        return
      }
      if (!isGettingStopLossTx) {
        setIsGettingStopLossTx(true)
        clearWarningsAndErrors()
      }

      const stopLossTxDataPromise = cancelable(
        setupStopLoss({
          action,
          dpm: dpmAccount,
          executionLTV: stopLossLevel,
          executionToken: stopLossToken === 'debt' ? debtAddress : collateralAddress,
          networkId: strategyConfig.networkId,
          poolId,
          protocol: strategyConfig.protocol as SupportedLambdaProtocols,
          strategy: {
            collateralAddress,
            debtAddress,
          },
        }),
      )
      setStopLossTxCancelablePromise(stopLossTxDataPromise)
      stopLossTxDataPromise
        .then((res) => {
          if (
            res.transaction &&
            res.encodedTriggerData &&
            res.transaction &&
            context.effectiveProxyAddress
          ) {
            send({
              type: 'SET_STOP_LOSS_TX_DATA_LAMBDA',
              stopLossTxDataLambda: {
                to: res.transaction.to,
                data: res.transaction.data,
              },
            })
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
            type: 'SET_STOP_LOSS_TX_DATA_LAMBDA',
            stopLossTxDataLambda: undefined,
          })
        })
        .finally(() => {
          setIsGettingStopLossTx(false)
        })
    },
    [stopLossLevel, stopLossToken, action],
    500,
  )
  return {
    stopLossTxCancelablePromise,
    isGettingStopLossTx,
    warnings,
    errors,
  }
}
