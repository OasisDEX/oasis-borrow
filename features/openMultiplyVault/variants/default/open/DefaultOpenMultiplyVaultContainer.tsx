import { OpenMultiplyVaultContainer } from 'components/vault/commonMultiply/OpenMultiplyVaultContainer'
import { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault'
import React from 'react'

import { DefaultVaultHeader } from '../../../../../components/vault/DefaultVaultHeader'
import { VaultHeading } from '../../../../../components/vault/VaultHeading'

export function DefaultOpenMultiplyVaultContainer(props: OpenMultiplyVaultState) {
  return (
    <OpenMultiplyVaultContainer
      header={
        <>
          <VaultHeading />
          <DefaultVaultHeader {...props} />
        </>
      }
      details={<DefaultOpenMultiplyVaultContainer {...props} />}
      form={<DefaultOpenMultiplyVaultForm {...props} />}
      clear={props.clear}
    />
  )
}
