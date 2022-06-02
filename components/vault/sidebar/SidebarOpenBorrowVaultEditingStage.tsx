import { OpenVaultChangesInformation } from 'features/borrow/open/containers/OpenVaultChangesInformation'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

import {
  extractFieldDepositCollateralData,
  extractFieldGenerateDaiData,
  FieldDepositCollateral,
  FieldGenerateDai,
} from './SidebarFields'
import { SidebarResetButton } from './SidebarResetButton'

export function SidebarOpenBorrowVaultEditingStage(props: OpenVaultState) {
  const {
    clear,
    depositAmount,
    inputAmountsEmpty,
    showGenerateOption,
    toggleGenerateOption,
    token,
  } = props

  const [isSecondaryFieldDisabled, setIsSecondaryFieldDisabled] = useState<boolean>(true)

  useEffect(() => {
    if (inputAmountsEmpty) {
      setIsSecondaryFieldDisabled(true)
    } else {
      if (!showGenerateOption) toggleGenerateOption!()
      setIsSecondaryFieldDisabled(false)
    }
  }, [depositAmount])

  return (
    <Grid gap={3}>
      <FieldDepositCollateral token={token} {...extractFieldDepositCollateralData(props)} />
      <FieldGenerateDai
        disabled={isSecondaryFieldDisabled}
        {...extractFieldGenerateDaiData(props)}
      />
      {!inputAmountsEmpty && <SidebarResetButton clear={clear} />}
      <OpenVaultChangesInformation {...props} />
    </Grid>
  )
}
