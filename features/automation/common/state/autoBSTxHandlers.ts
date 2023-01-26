import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { useAppContext } from 'components/AppContextProvider'
import { maxUint256 } from 'features/automation/common/consts'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { prepareAddAutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutoBSTriggerTypes, AutomationBSPublishType } from 'features/automation/common/types'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

interface GetAutoBSTxHandlersParams {
  autoBSState: AutoBSFormChange
  isAddForm: boolean
  publishType: AutomationBSPublishType
  triggerType: AutoBSTriggerTypes
  positionRatio: BigNumber
  id: BigNumber
  owner: string
}

interface AutoBSTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getAutoBSTxHandlers({
  autoBSState,
  isAddForm,
  publishType,
  triggerType,
  positionRatio,
  id,
  owner,
}: GetAutoBSTxHandlersParams): AutoBSTxHandlers {
  const { uiChanges } = useAppContext()

  const unlimitedMaxMinPrice = triggerType === TriggerType.BasicSell ? zero : maxUint256

  const addTxData = useMemo(
    () =>
      prepareAddAutoBSTriggerData({
        id,
        owner,
        triggerType,
        execCollRatio: autoBSState.execCollRatio,
        targetCollRatio: autoBSState.targetCollRatio,
        maxBuyOrMinSellPrice: autoBSState.withThreshold
          ? autoBSState.maxBuyOrMinSellPrice || zero
          : unlimitedMaxMinPrice,
        continuous: autoBSState.continuous,
        deviation: autoBSState.deviation,
        replacedTriggerId: autoBSState.triggerId,
        maxBaseFeeInGwei: autoBSState.maxBaseFeeInGwei,
      }),
    [
      autoBSState.withThreshold,
      autoBSState.execCollRatio.toNumber(),
      autoBSState.targetCollRatio.toNumber(),
      autoBSState.maxBuyOrMinSellPrice?.toNumber(),
      autoBSState.triggerId.toNumber(),
      autoBSState.maxBaseFeeInGwei.toNumber(),
      positionRatio.toNumber(),
    ],
  )

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(publishType, {
        type: 'execution-coll-ratio',
        execCollRatio: zero,
      })
      uiChanges.publish(publishType, {
        type: 'target-coll-ratio',
        targetCollRatio: zero,
      })
    }
  }

  return {
    addTxData,
    textButtonHandlerExtension,
  }
}
