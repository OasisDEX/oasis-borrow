import { getAddresses } from 'actions/aave-like/get-addresses'
import type BigNumber from 'bignumber.js'
import type CancelablePromise from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import type { SetupBasicStopLossResponse } from 'helpers/triggers/setup-triggers'
import { setupAaveStopLoss } from 'helpers/triggers/setup-triggers'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { hundred } from 'helpers/zero'
import { useState } from 'react'

import { eth2weth } from '@oasisdex/utils/lib/src/utils'

export const useLambdaDebouncedStopLoss = ({
  state,
  send,
  stopLossLevel,
  stopLossToken,
}: OpenAaveStateProps & { stopLossLevel: BigNumber; stopLossToken: string }) => {
  const [isGettingStopLossTx, setIsGettingStopLossTx] = useState(false)
  const [stopLossTxCancelablePromise, setStopLossTxCancelablePromise] =
    useState<CancelablePromise<SetupBasicStopLossResponse>>()
  const { strategyConfig } = state.context
  const { tokens } = getAddresses(strategyConfig.networkId, strategyConfig.protocol)
  const collateralAddress = tokens[eth2weth(state.context.tokens.collateral) as keyof typeof tokens]
  const debtAddress = tokens[eth2weth(state.context.tokens.debt) as keyof typeof tokens]

  useDebouncedEffect(
    () => {
      const { context } = state
      if (!context.userDpmAccount || !stopLossLevel || !collateralAddress || !debtAddress) {
        return
      }
      if (!isGettingStopLossTx) {
        setIsGettingStopLossTx(true)
      }
      const stopLossTxDataPromise = cancelable(
        setupAaveStopLoss({
          dpm: context.userDpmAccount.proxy,
          executionLTV: stopLossLevel,
          targetLTV: (
            context.userInput.riskRatio?.loanToValue ?? context.defaultRiskRatio!.loanToValue
          ).times(hundred),
          networkId: strategyConfig.networkId,
          executionToken: stopLossToken === 'debt' ? debtAddress : collateralAddress,
          protocol: strategyConfig.protocol,
          strategy: {
            collateralAddress,
            debtAddress,
          },
        }),
      )
      setStopLossTxCancelablePromise(stopLossTxDataPromise)
      stopLossTxDataPromise
        .then((res) => {
          if (res.transaction && context.userDpmAccount) {
            send({
              type: 'SET_STOP_LOSS_TX_DATA_LAMBDA',
              stopLossTxDataLambda: {
                to: res.transaction.to,
                data: res.transaction.data,
                triggerTxData: res.transaction.triggerTxData,
                encodedTriggerData: res.encodedTriggerData,
              },
            })
          }
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
    [stopLossLevel, stopLossToken],
    500,
  )
  return {
    stopLossTxCancelablePromise,
    isGettingStopLossTx,
  }
}
