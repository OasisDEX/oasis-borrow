import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { OptimizationDetailsControl } from 'features/automation/optimization/controls/OptimizationDetailsControl'
import { OptimizationFormControl } from 'features/automation/optimization/controls/OptimizationFormControl'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import React, { useEffect, useState } from 'react'

import { DefaultVaultLayout } from './DefaultVaultLayout'

interface OptimizationControlProps {
  vault: Vault
}

export function OptimizationControl({ vault }: OptimizationControlProps) {
  const { uiChanges } = useAppContext()
  const [isAutoBuyOn] = useState<boolean>(false) // should be taken from pipeline or triggers
  const [isEditingAutoBuy, setEditingIsAutoBuy] = useState<boolean>(false)

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
    const subscription = uiChanges$.subscribe((value) => {
      console.log(value)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <DefaultVaultLayout
      detailsViewControl={
        <OptimizationDetailsControl
          vault={vault}
          isAutoBuyOn={isAutoBuyOn}
          isEditingAutoBuy={isEditingAutoBuy}
        />
      }
      editForm={
        <OptimizationFormControl
          vault={vault}
          isAutoBuyOn={isAutoBuyOn}
          isEditingAutoBuy={isEditingAutoBuy}
        />
      }
    />
  )
}
