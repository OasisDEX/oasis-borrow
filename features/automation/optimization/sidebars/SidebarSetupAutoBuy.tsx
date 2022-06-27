import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { addAutomationBotTrigger } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { MaxGasPriceSection } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import { prepareAddBasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { failedStatuses, progressStatuses } from 'features/automation/protection/common/consts/txStatues'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import {
  BASIC_BUY_FORM_CHANGE,
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { handleNumericInput } from 'helpers/input'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoBuyProps {
  isAutoBuyOn: boolean
  vault: Vault
  // txState?: TxStatus
  isProgressDisabled: boolean
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  withThreshold: boolean
  maxBuyOrMinSellPrice?: BigNumber
  continuous: boolean
  deviation: BigNumber
  replacedTriggerId: BigNumber,
}

export function SidebarSetupAutoBuy({ isAutoBuyOn, vault, execCollRatio, targetCollRatio, withThreshold, maxBuyOrMinSellPrice, continuous, deviation, replacedTriggerId }: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()

  const { uiChanges, txHelpers$ } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  // TODO ŁW move stuff from uiState to props, init uiState in OptimizationFormControl pass props
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)

  const txData = useMemo(
    () => prepareAddBasicBSTriggerData({
    vaultData: vault,
    triggerType: TriggerType.BasicBuy,
    execCollRatio: execCollRatio,
    targetCollRatio: targetCollRatio,
    maxBuyOrMinSellPrice: withThreshold ? maxBuyOrMinSellPrice || zero : zero, // todo we will need here validation that this field cant be empty
    continuous: continuous, // leave as default
    deviation: deviation,
    replacedTriggerId: replacedTriggerId,
  }),
  [execCollRatio, targetCollRatio, maxBuyOrMinSellPrice, replacedTriggerId],
  ) //TODO ŁW verify l8r if uiState variables are correct, it might behave differently form AdjustSlFormControl

  if (isAutoBuyOn || activeAutomationFeature?.currentOptimizationFeature === 'autoBuy') {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('auto-buy.form-title'),
      content: (
        <Grid gap={3}>
          <MultipleRangeSlider
            min={170}
            max={500}
            onChange={(value) => {
              uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
                type: 'target-coll-ratio',
                targetCollRatio: new BigNumber(value.value0),
              })
              uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
                type: 'execution-coll-ratio',
                execCollRatio: new BigNumber(value.value1),
              })
            }}
            defaultValue={{
              value0: uiState.targetCollRatio.toNumber(),
              value1: uiState.execCollRatio.toNumber(),
            }}
            valueColors={{
              value1: 'onSuccess',
            }}
            leftDescription={t('auto-buy.target-coll-ratio')}
            rightDescription={t('auto-buy.trigger-coll-ratio')}
            minDescription={`(${t('auto-buy.min-ratio')})`}
          />
          <VaultActionInput
            action={t('auto-buy.set-max-buy-price')}
            amount={uiState.maxBuyOrMinSellPrice}
            hasAuxiliary={true}
            hasError={false}
            token="ETH"
            onChange={handleNumericInput((maxBuyOrMinSellPrice) => {
              uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
                type: 'max-buy-or-sell-price',
                maxBuyOrMinSellPrice,
              })
            })}
            onToggle={(toggleStatus) => {
              uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
                type: 'with-threshold',
                withThreshold: toggleStatus,
              })
            }}
            onAuxiliaryChange={() => {}}
            showToggle={true}
            toggleOnLabel={t('protection.set-no-threshold')}
            toggleOffLabel={t('protection.set-threshold')}
            toggleOffPlaceholder={t('protection.no-threshold')}
          />
          <SidebarResetButton
            clear={() => {
              alert('Reset!')
            }}
          />
          <MaxGasPriceSection
            onChange={(maxGasPercentagePrice) => {
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'max-gas-percentage-price',
                maxGasPercentagePrice,
              })
            }}
            defaultValue={uiState.maxGasPercentagePrice}
          />
        </Grid>
      ),
      primaryButton: {
        label: 'Confirm',
        disabled: false, //isProgressDisabled,
        action: () => {
          if (txHelpers) {
            txHelpers
              .sendWithGasEstimation(addAutomationBotTrigger, txData)
              .subscribe((next) => console.log(next))
          }
        },
      },
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
