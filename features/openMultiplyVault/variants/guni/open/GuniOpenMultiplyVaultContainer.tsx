import { GuniVaultHeader } from 'features/openMultiplyVault/variants/guni/GuniVaultHeader'
import { GuniOpenMultiplyVaultDetails } from 'features/openMultiplyVault/variants/guni/open/GuniOpenMultiplyVaultDetails'
import { GuniOpenMultiplyVaultForm } from 'features/openMultiplyVault/variants/guni/open/GuniOpenMultiplyVaultForm'
import React from 'react'

import { OpenMultiplyVaultContainer } from '../../../common/OpenMultiplyVaultContainer'
import { OpenMultiplyVaultState } from '../../../openMultiplyVault'

export function GuniOpenMultiplyVaultContainer(props: OpenMultiplyVaultState) {
  return (
    <OpenMultiplyVaultContainer
      {...props}
      header={GuniVaultHeader}
      details={GuniOpenMultiplyVaultDetails}
      form={GuniOpenMultiplyVaultForm}
    />
  )
}
