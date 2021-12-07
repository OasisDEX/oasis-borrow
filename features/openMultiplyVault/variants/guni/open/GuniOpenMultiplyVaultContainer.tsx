import { GuniVaultHeader } from 'features/openMultiplyVault/variants/guni/GuniVaultHeader'
import { GuniOpenMultiplyVaultDetails } from 'features/openMultiplyVault/variants/guni/open/GuniOpenMultiplyVaultDetails'
import { GuniOpenMultiplyVaultForm } from 'features/openMultiplyVault/variants/guni/open/GuniOpenMultiplyVaultForm'
import React from 'react'

import { VaultHeading } from '../../../../../components/vault/VaultHeading'
import { OpenGuniVaultState } from '../../../../openGuniVault/openGuniVault'
import { OpenMultiplyVaultContainer } from '../../../common/OpenMultiplyVaultContainer'

export function GuniOpenMultiplyVaultContainer(props: OpenGuniVaultState) {
  return (
    <OpenMultiplyVaultContainer
      header={
        <>
          <VaultHeading />
          <GuniVaultHeader {...props} />
        </>
      }
      details={<GuniOpenMultiplyVaultDetails {...props} />}
      form={<GuniOpenMultiplyVaultForm {...props} />}
      clear={props.clear}
    />
  )
}
