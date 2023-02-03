import { FlowSidebar } from 'components/FlowSidebar'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useFlowState } from 'helpers/useFlowState'
import React from 'react'

export function AjnaBorrowFormDpm() {
  const {
    form: {
      state: { depositAmount },
    },
    steps: { currentStep, setNextStep, setPrevStep },
  } = useAjnaBorrowContext()

  const flowState = useFlowState({
    amount: depositAmount,
    token: 'DAI',
    onEverythingReady({user}) {
      console.log(params)
      console.log(currentStep)
      setNextStep()
    },
    onGoBack(params) {
      console.log(params)
      console.log(currentStep)
      // setPrevStep()
    },
  })

  return <FlowSidebar {...flowState} />
}
