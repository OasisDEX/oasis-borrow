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

// This offset is needed for actions like paybackAll and withdrawAll because of the debt that is constantly growing over time
// performing these actions without this buffer would lead to issues with tx since params passed will be already out of date
// while sending tx
export const omniPaybackAllWithdrawAllValueOffset = new BigNumber(0.00005) // 0.005%

export const paybackAllAmountAllowanceMaxMultiplier: Record<LendingProtocol, BigNumber> = {
  aavev2: one,
  aavev3: one,
  maker: one,
  morphoblue: one,
  sparkv3: one,
  ajna: one.plus(omniPaybackAllWithdrawAllValueOffset),
}
