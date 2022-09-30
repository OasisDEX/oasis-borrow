import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { zero } from 'helpers/zero'
import { useEffect } from 'react'

import { AUTO_TAKE_PROFIT_FORM_CHANGE } from './autoTakeProfitFormChange'

export function useAutoTakeProfitStateInitializator(vault: Vault | InstiVault) {
  const { uiChanges } = useAppContext()
  // const { autoTakeProfitLevel, isAutoTakeProfitEnabled, isToCollateral, triggerId } = autoTakeProfitTriggerData;
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  //   const sliderMin = TODO ŁW
  //   const selectedAutoTakeProfitCollRatioIfTriggerDoesntExist = vault.collateralizationRatio.isZero()
  // ŁW dummy initial data
  const isToCollateral = true
  const triggerId = zero
  const initialSelectedTakeProfitRatio = vault.collateralizationRatio.multipliedBy(100)
  useEffect(() => {
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'form-defaults',
      executionCollRatio: initialSelectedTakeProfitRatio,
      toCollateral: isToCollateral,
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'execution-coll-ratio',
      executionCollRatio: initialSelectedTakeProfitRatio, // why it remains undefined !!!?
    })
  }, [triggerId.toNumber(), collateralizationRatio])

  // useEffect(() => {
  //   uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
  //     type: 'tx-details',
  //     txDetails: {},
  //   })
  //   uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
  //     type: 'current-form',
  //     currentForm: 'add',
  //   })
  // }, [collateralizationRatio])

  const isAutoTakeProfitEnabled = true
  return isAutoTakeProfitEnabled
}
