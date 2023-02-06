import { FlowSidebar } from 'components/FlowSidebar'
import { AjnaBorrowFormContent } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContent'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useFlowState } from 'helpers/useFlowState'
import React, { useEffect } from 'react'
import { Box } from 'theme-ui'

export function AjnaBorrowFormWrapper() {
  const {
    environment: { collateralToken, quoteToken },
    form: {
      state: { action, depositAmount, paybackAmount },
      updateState,
    },
    steps: { currentStep, isExternalStep, setNextStep, setPrevStep, setStep },
  } = useAjnaBorrowContext()

  const flowState = useFlowState({
    ...((action === 'open' || action === 'deposit') && {
      amount: depositAmount,
      token: collateralToken,
    }),
    ...(action === 'payback' && {
      amount: paybackAmount,
      token: quoteToken,
    }),
    onEverythingReady: (params) => {
      console.log('ready')
      console.log(params)
      // setNextStep()
    },
    onGoBack: (params) => {
      console.log('goBack')
      console.log(params)
      setStep('setup')
      // setPrevStep()
    },
  })

  console.log(flowState)

  useEffect(() => {
    if (flowState.availableProxies.length) updateState('dpmAddress', flowState.availableProxies[0])
  }, [flowState.availableProxies])

  return (
    <Box>
      {!isExternalStep ? (
        <AjnaBorrowFormContent />
      ) : (
        <>{currentStep === 'dpm' && <FlowSidebar {...flowState} />}</>
      )}
    </Box>
  )
}
