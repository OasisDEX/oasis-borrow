import { ManageVaultHeaderAllowance } from 'components/vault/commonMultiply/ManageVaultHeaderAllowance'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import React from 'react'
import { Box } from 'theme-ui'

export function GuniManageMultiplyVaultFormHeader(props: ManageMultiplyVaultState) {
  const { isEditingStage } = props

  return <Box>{!isEditingStage && <ManageVaultHeaderAllowance {...props} />}</Box>
}
