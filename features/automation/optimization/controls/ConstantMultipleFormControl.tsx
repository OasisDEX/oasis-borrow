import { TxStatus } from '@oasisdex/transactions'
import { Context } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { failedStatuses, progressStatuses } from 'features/automation/common/txStatues'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

import { SidebarSetupConstantMultiple } from '../sidebars/SidebarSetupConstantMultiple'

interface ConstantMultipleFormControlProps {
  context: Context
  isConstantMultipleActive: boolean
  txHelpers?: TxHelpers
}

export function ConstantMultipleFormControl({
  context,
  isConstantMultipleActive,
  txHelpers,
}: ConstantMultipleFormControlProps) {
  const { uiChanges /*, addGasEstimation$*/ } = useAppContext()
  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )

  const txStatus = constantMultipleState?.txDetails?.txStatus
  const isFailureStage = txStatus && failedStatuses.includes(txStatus)
  const isProgressStage = txStatus && progressStatuses.includes(txStatus)
  const isSuccessStage = txStatus === TxStatus.Success

  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : 'editing'

    const isAddForm = constantMultipleState.currentForm === 'add'
    const isRemoveForm = constantMultipleState.currentForm === 'remove'

  function txHandler() {
    if (txHelpers) {
      if (stage === 'txSuccess') {
        uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
          type: 'tx-details',
          txDetails: {},
        })
        uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
          type: 'current-form',
          currentForm: 'add',
        })
      } else {
        if (isAddForm) {
          // addBasicBSTrigger(txHelpers, addTxData, uiChanges, ethMarketPrice, BASIC_BUY_FORM_CHANGE)
        }
        if (isRemoveForm) {
          // TODO ŁW can't remove as can't load from cache

        }
      }
    }
  }

  return (
    <SidebarSetupConstantMultiple
      stage={'editing'}
      constantMultipleState={constantMultipleState}
      isAddForm={true}
      isRemoveForm={false}
      isDisabled={false}
      isFirstSetup={true}
      onChange={(multiplier) => {
        uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
          type: 'multiplier',
          multiplier: multiplier,
        })
      }}
      
    />
  )
}
