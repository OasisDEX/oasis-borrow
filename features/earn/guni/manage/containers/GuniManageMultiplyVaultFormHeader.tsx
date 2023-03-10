import React from 'react'
import { Box } from 'theme-ui'

import { ManageVaultHeaderAllowance } from '../../../../../components/vault/commonMultiply/ManageVaultHeaderAllowance'
import { ManageMultiplyVaultState } from '../../../../multiply/manage/pipes/manageMultiplyVault'

export function GuniManageMultiplyVaultFormHeader(props: ManageMultiplyVaultState) {
  const { isEditingStage } = props

  return <Box>{!isEditingStage && <ManageVaultHeaderAllowance {...props} />}</Box>
}
