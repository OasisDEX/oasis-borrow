import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { addAutomationBotTrigger, removeAutomationBotTrigger } from 'blockchain/calls/automationBot'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { MaxGasPriceSection, MaxGasPriceValues } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import {
  BasicBSTriggerData,
  prepareAddBasicBSTriggerData,
  prepareRemoveBasicBSTriggerData,
} from 'features/automation/common/basicBSTriggerData'
import { addBasicBSTrigger, removeBasicBSTrigger } from 'features/automation/common/basicBStxHandlers'
import { failedStatuses, progressStatuses } from 'features/automation/protection/common/consts/txStatues'
import { backToVaultOverview } from 'features/automation/protection/common/helpers'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import {
  BASIC_BUY_FORM_CHANGE,
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
  CurrentBSForm,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { PriceInfo } from 'features/shared/priceInfo'
import { handleNumericInput } from 'helpers/input'
import { useObservable } from 'helpers/observableHook'
import { TxError } from 'helpers/types'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Grid } from 'theme-ui'
import { SidebarAutoBuyAdditionStage } from './SidebarAutoBuyAdditionStage'
import { SidebarAutoBuyEditingStage } from './SidebarAutoBuyEditingStage'

export interface SidebarSetupAutoBuyProps {
  isAutoBuyOn: boolean
  vault: Vault
  autoBuyTriggerData: BasicBSTriggerData
  ilkData: IlkData
  stage: 'basicBuyEditing' | 'txInProgress' | 'txSuccess' | 'txFailure' //TODO ŁW - create common enum?
  currentForm: CurrentBSForm
  // maxGasPercentagePrice?: MaxGasPriceValues
  priceInfo: PriceInfo
}


export function SidebarSetupAutoBuy({  
  isAutoBuyOn,
  vault,
  ilkData,
  autoBuyTriggerData,
  currentForm, 
  // maxGasPercentagePrice,
  priceInfo,

}: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)
  const { uiChanges, txHelpers$ } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  // TODO ŁW move stuff from uiState to props, init uiState in OptimizationFormControl pass props
  // const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)

  // const flow = firstSetup ? 'add' : 'adjust'
  const txStatus = uiState?.txDetails?.txStatus
  const isFailureStage = txStatus && failedStatuses.includes(txStatus)
  const isProgressStage = txStatus && progressStatuses.includes(txStatus)
  const isSuccessStage = txStatus === TxStatus.Success

  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : 'basicBuyEditing'
  
    console.log('stage')
    console.log(stage)

  const addTxData = useMemo(
    () =>
    prepareAddBasicBSTriggerData({
    vaultData: vault,
    triggerType: TriggerType.BasicBuy,
    execCollRatio: uiState.execCollRatio,
    targetCollRatio: uiState.targetCollRatio,
    maxBuyOrMinSellPrice: uiState.withThreshold ? uiState.maxBuyOrMinSellPrice || zero : zero, // todo we will need here validation that this field cant be empty
    continuous: uiState.continuous, // leave as default
    deviation: uiState.deviation,
    replacedTriggerId: uiState.triggerId,
  }),
  [
    uiState.execCollRatio.toNumber(),
    uiState.targetCollRatio.toNumber(),
    uiState.maxBuyOrMinSellPrice?.toNumber(),
    uiState.triggerId.toNumber(),
  ],
)

  const removeTxData = prepareRemoveBasicBSTriggerData({
    vaultData: vault,
    triggerType: TriggerType.BasicSell,
    triggerId: uiState.triggerId,
  })

  const isAddForm = currentForm === 'add'

  const isProgressDisabled = !!(
    // !isOwner ||
    // (!isEditing && txStatus !== TxStatus.Success) ||
    isProgressStage
  )

  if (isAutoBuyOn || activeAutomationFeature?.currentOptimizationFeature === 'autoBuy') {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('auto-buy.form-title'),
      content: (
        <Grid gap={3}>
          {isAddForm && (
              <SidebarAutoBuyEditingStage
                vault={vault}
                ilkData={ilkData}
                addTxData={addTxData}
                basicBuyState={uiState}
              />
          )}
          {currentForm === 'remove' && <>Remove form TBD</>}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutoBuyAdditionStage stage={stage} />
          )}
        </Grid>
      ),
      primaryButton: {
        label: t('confirm'),
        disabled: isProgressDisabled,
        isLoading: stage === 'txInProgress',
        action: () => {
          console.log('stage')
          console.log(stage)
          if (txHelpers /*&& stage !== 'txSuccess'*/) {
            if (isAddForm) {
              addBasicBSTrigger(txHelpers, addTxData, uiChanges, priceInfo.currentEthPrice)
            }
            if (currentForm === 'remove') {
              removeBasicBSTrigger(txHelpers, removeTxData, uiChanges, priceInfo.currentEthPrice)
            }
          }
        },
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: isAddForm ? t('system.remove-trigger') : t('system.add-trigger'),
          hidden: uiState.triggerId.isZero(),
          action: () => {
            uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
              type: 'current-form',
              currentForm: isAddForm ? 'remove' : 'add',
            })
          },
        },
      }),
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
