import { getAddresses } from 'actions/aave-like/get-addresses'
import type BigNumber from 'bignumber.js'
import type CancelablePromise from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import type { SupportedLambdaProtocols } from 'helpers/triggers'
import type {
  SetupBasicStopLossResponse,
  TriggerAction,
  TriggersApiError,
  TriggersApiWarning,
} from 'helpers/triggers/setup-triggers'
import { setupAaveLikeStopLoss } from 'helpers/triggers/setup-triggers'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { hundred, one } from 'helpers/zero'
import { useState } from 'react'

import { eth2weth } from '@oasisdex/utils/lib/src/utils'

export const useLambdaDebouncedStopLoss = ({
  state,
  send,
  stopLossLevel,
  stopLossToken,
  action,
}: (OpenAaveStateProps | ManageAaveStateProps) & {
  stopLossLevel: BigNumber
  stopLossToken: string
  action: TriggerAction
}) => {
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
      const openingLtv =
        context.userInput.riskRatio?.loanToValue ?? context.defaultRiskRatio?.loanToValue
      const manageLtv =
        context.userInput.riskRatio?.loanToValue ?? context.currentPosition?.riskRatio?.loanToValue
      const stopLossTxDataPromise = cancelable(
        setupAaveLikeStopLoss({
          dpm: dpmAccount,
          executionLTV: stopLossLevel,
          targetLTV: (openingLtv ?? manageLtv ?? one).times(hundred),
          networkId: strategyConfig.networkId,
          executionToken: stopLossToken === 'debt' ? debtAddress : collateralAddress,
          protocol: strategyConfig.protocol as SupportedLambdaProtocols,
          strategy: {
            collateralAddress,
            debtAddress,
          },
          action,
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
