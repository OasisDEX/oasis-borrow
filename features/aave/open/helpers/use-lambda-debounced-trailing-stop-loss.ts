import { getAddresses } from 'actions/aave-like/get-addresses'
import type BigNumber from 'bignumber.js'
import type CancelablePromise from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import type { SupportedLambdaProtocols } from 'helpers/triggers'
import type {
  SetupTrailingStopLossResponse,
  TriggerAction,
  TriggersApiError,
  TriggersApiWarning,
} from 'helpers/triggers/setup-triggers'
import { setupAaveLikeTrailingStopLoss } from 'helpers/triggers/setup-triggers/setup-aave-trailing-stop-loss'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useState } from 'react'

import { eth2weth } from '@oasisdex/utils/lib/src/utils'

export const useLambdaDebouncedTrailingStopLoss = ({
  state,
  send,
  trailingDistance,
  trailingDistanceValue,
  trailingStopLossToken,
  action,
}: (OpenAaveStateProps | ManageAaveStateProps) & {
  trailingDistance: BigNumber
  trailingDistanceValue: BigNumber
  trailingStopLossToken: string
  action: TriggerAction
}) => {
  const [isGettingTrailingStopLossTx, setIsGettingTrailingStopLossTx] = useState(false)
  const [warnings, setWarnings] = useState<TriggersApiWarning[]>([])
  const [errors, setErrors] = useState<TriggersApiError[]>([])
  const [trailingStopLossTxCancelablePromise, setTrailingStopLossTxCancelablePromise] =
    useState<CancelablePromise<SetupTrailingStopLossResponse>>()
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
      if (!dpmAccount || !trailingDistance || !collateralAddress || !debtAddress) {
        return
      }
      if (!isGettingTrailingStopLossTx) {
        setIsGettingTrailingStopLossTx(true)
        clearWarningsAndErrors()
      }
      const trailingStopLossTxDataPromise = cancelable(
        setupAaveLikeTrailingStopLoss({
          dpm: dpmAccount,
          trailingDistance: trailingDistanceValue,
          networkId: strategyConfig.networkId,
          executionToken: trailingStopLossToken === 'debt' ? debtAddress : collateralAddress,
          protocol: strategyConfig.protocol as SupportedLambdaProtocols,
          strategy: {
            collateralAddress,
            debtAddress,
          },
          action,
        }),
      )

      setTrailingStopLossTxCancelablePromise(trailingStopLossTxDataPromise)
      trailingStopLossTxDataPromise
        .then((res) => {
          if (res.transaction) {
            send({
              type: 'SET_TRAILING_STOP_LOSS_TX_DATA_LAMBDA',
              trailingStopLossTxDataLambda: {
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
        })
        .finally(() => {
          setIsGettingTrailingStopLossTx(false)
        })
    },
    [trailingDistance, trailingStopLossToken, action],
    500,
  )
  return {
    trailingStopLossTxCancelablePromise,
    isGettingTrailingStopLossTx,
    warnings,
    errors,
  }
}
