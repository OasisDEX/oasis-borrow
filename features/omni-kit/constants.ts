import BigNumber from 'bignumber.js'
import { OmniProductType, OmniSidebarStep } from 'features/omni-kit/types'
import { one } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'

export const omniBorrowishProducts = [OmniProductType.Borrow, OmniProductType.Multiply]

export const omniSidebarSharedSteps = [OmniSidebarStep.Dpm, OmniSidebarStep.Transaction]

export const omniSidebarSetupSteps = [OmniSidebarStep.Setup, ...omniSidebarSharedSteps]

export const omniSidebarManageSteps = [OmniSidebarStep.Manage, ...omniSidebarSharedSteps]

export const omniSidebarManageBorrowishSteps = [
  ...omniSidebarManageSteps,
  OmniSidebarStep.Transition,
]

export const omniFormExternalSteps: OmniSidebarStep[] = [OmniSidebarStep.Dpm]
export const omniFormStepsWithTransaction: OmniSidebarStep[] = [OmniSidebarStep.Transaction]

export const omniLendingPriceColors = ['#D3D4D8', '#EABE4C', '#1ECBAE']

export const paybackAllAmountAllowanceMaxMultiplier: Record<LendingProtocol, BigNumber> = {
  aavev2: one,
  aavev3: one,
  maker: one,
  morphoblue: one,
  sparkv3: one,
  ajna: one.plus(new BigNumber(0.00005)), // 1 + 0.005%
}
