import React from 'react'
import { Box } from 'theme-ui'

import { ManageMultiplyVaultState } from '../../../../manageMultiplyVault/manageMultiplyVault'
import { ManageVaultHeaderAllowance } from '../../../common/ManageVaultHeaderAllowance'

export function GuniManageMultiplyVaultFormHeader(props: ManageMultiplyVaultState) {
  const { isEditingStage } = props

  return <Box>{!isEditingStage && <ManageVaultHeaderAllowance {...props} />}</Box>
}
