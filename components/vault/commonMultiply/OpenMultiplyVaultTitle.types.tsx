import type { OpenMultiplyVaultStage } from 'features/multiply/open/pipes/openMultiplyVault.types'
import type { ReactNode } from 'react'

export interface OpenMultiplyVaultTitleProps {
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  token: string
  totalSteps: number
  currentStep: number
  stage: OpenMultiplyVaultStage
  title: string
  subTitle: ReactNode
}
