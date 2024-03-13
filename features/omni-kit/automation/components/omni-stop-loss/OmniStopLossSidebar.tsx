import {
  OmniStopLossSidebarPrepare,
  OmniStopLossSidebarTransaction,
} from 'features/omni-kit/automation/components'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { OmniSidebarAutomationStep } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

interface OmniStopLossOverviewDetailsSectionProps {}

export const OmniStopLossSidebar: FC<OmniStopLossOverviewDetailsSectionProps> = () => {
  const {
    automationSteps: { currentStep },
  } = useOmniGeneralContext()

  return {
    [OmniSidebarAutomationStep.Manage]: <OmniStopLossSidebarPrepare />,
    [OmniSidebarAutomationStep.Transaction]: <OmniStopLossSidebarTransaction />,
  }[currentStep]
}
