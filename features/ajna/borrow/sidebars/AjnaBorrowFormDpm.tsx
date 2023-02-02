import BigNumber from 'bignumber.js'
import { FlowSidebar } from 'components/FlowSidebar'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useFlowState } from 'helpers/useFlowState'
import React from 'react'

export function AjnaBorrowFormDpm() {
  const {
    steps: { currentStep, setNextStep, setPrevStep },
  } = useAjnaBorrowContext()

  const flowState = useFlowState({
    amount: new BigNumber(500),
    token: 'DAI',
    onEverythingReady() {
      setNextStep()
    },
    onGoBack() {
      setPrevStep()
    },
  })

  return (
    <>
      currentStep: {currentStep}
      <button onClick={() => setPrevStep()}>back</button>
      <FlowSidebar {...flowState} />
    </>
  )
}
