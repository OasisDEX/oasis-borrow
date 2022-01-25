import { OpenMultiplyVaultContainer } from 'components/vault/commonMultiply/OpenMultiplyVaultContainer'
import { VaultHeading } from 'components/vault/VaultHeading'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { GuniOpenMultiplyVaultDetails } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultDetails'
import { GuniOpenMultiplyVaultForm } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultForm'
import { OpenGuniVaultState } from 'features/earn/guni/open/pipes/openGuniVault'
import React from 'react'

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
