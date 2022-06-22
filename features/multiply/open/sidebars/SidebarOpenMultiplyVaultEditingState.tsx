import BigNumber from 'bignumber.js'
import {
  extractFieldDepositCollateralData,
  FieldDepositCollateral,
} from 'components/vault/sidebar/SidebarFields'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarSliderAdjustMultiply } from 'components/vault/sidebar/SidebarSliders'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { OpenMultiplyVaultChangesInformation } from 'features/multiply/open/containers/OpenMultiplyVaultChangesInformation'
import { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault'
import { extractCommonErrors, extractCommonWarnings } from 'helpers/messageMappers'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarOpenMultiplyVaultEditingState(props: OpenMultiplyVaultState) {
  const {
    canAdjustRisk,
    clear,
    errorMessages,
    ilkData: { liquidationRatio },
    inputAmountsEmpty,
    maxCollRatio,
    requiredCollRatio,
    token,
    updateRequiredCollRatio,
    warningMessages,
  } = props

  return (
    <Grid gap={3}>
      <FieldDepositCollateral token={token} {...extractFieldDepositCollateralData(props)} />
      <SidebarSliderAdjustMultiply
        state={props}
        min={liquidationRatio}
        max={maxCollRatio}
        value={canAdjustRisk && requiredCollRatio ? requiredCollRatio : new BigNumber(100)}
        onChange={(e) => {
          updateRequiredCollRatio && updateRequiredCollRatio(new BigNumber(e.target.value))
        }}
      />
      {!inputAmountsEmpty && <SidebarResetButton clear={clear} />}
      <VaultErrors {...props} errorMessages={extractCommonErrors(errorMessages)} />
      <VaultWarnings {...props} warningMessages={extractCommonWarnings(warningMessages)} />
      <OpenMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
