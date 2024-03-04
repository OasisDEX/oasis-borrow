import { getAddresses } from 'actions/aave-like/get-addresses'
import type BigNumber from 'bignumber.js'
import type CancelablePromise from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import type { SupportedLambdaProtocols } from 'helpers/triggers'
import type {
  SetupPartialTakeProfitResponse,
  TriggerAction,
  TriggersApiError,
  TriggersApiWarning,
} from 'helpers/triggers/setup-triggers'
import { setupAaveLikePartialTakeProfit } from 'helpers/triggers/setup-triggers/setup-aave-partial-take-profit'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useState } from 'react'

import { eth2weth } from '@oasisdex/utils/lib/src/utils'

export const useLambdaDebouncedPartialTakeProfit = ({
  state,
  send,
  triggerLtv,
  withdrawalLtv,
  startingTakeProfitPrice,
  partialTakeProfitToken,
  action,
}: (OpenAaveStateProps | ManageAaveStateProps) & {
  triggerLtv: BigNumber
  withdrawalLtv: BigNumber
  startingTakeProfitPrice: BigNumber
  partialTakeProfitToken: string
  action: TriggerAction
}) => {
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

  useDebouncedEffect(
    () => {
      const { context } = state
      const dpmAccount = context.effectiveProxyAddress
      if (
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
      const partialTakeProfitTxDataPromise = cancelable(
        setupAaveLikePartialTakeProfit({
          dpm: dpmAccount,
          networkId: strategyConfig.networkId,
          executionToken: partialTakeProfitToken === 'debt' ? debtAddress : collateralAddress,
          protocol: strategyConfig.protocol as SupportedLambdaProtocols,
          triggerLtv,
          withdrawalLtv,
          startingTakeProfitPrice,
          strategy: {
            collateralAddress,
            debtAddress,
          },
          action,
        }),
      )

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
        })
        .finally(() => {
          setIsGettingPartialTakeProfitTx(false)
        })
    },
    [triggerLtv, withdrawalLtv, startingTakeProfitPrice, partialTakeProfitToken, action],
    500,
  )
  return {
    partialTakeProfitTxCancelablePromise,
    isGettingPartialTakeProfitTx,
    warnings,
    errors,
  }
}
