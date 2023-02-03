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
    steps: { currentStep, isExternalStep, setNextStep, setPrevStep },
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
    onEverythingReady: () => setNextStep(),
    onGoBack: () => setPrevStep(),
  })

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
