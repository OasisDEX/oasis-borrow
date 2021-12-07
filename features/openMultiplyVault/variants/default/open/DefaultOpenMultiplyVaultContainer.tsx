import React from 'react'

import { DefaultVaultHeader } from '../../../../../components/vault/DefaultVaultHeader'
import { VaultHeading } from '../../../../../components/vault/VaultHeading'
import { OpenMultiplyVaultContainer } from '../../../common/OpenMultiplyVaultContainer'
import { OpenMultiplyVaultState } from '../../../openMultiplyVault'
import { DefaultOpenMultiplyVaultDetails } from './DefaultOpenMultiplyVaultDetails'
import { DefaultOpenMultiplyVaultForm } from './DefaultOpenMultiplyVaultForm'

export function DefaultOpenMultiplyVaultContainer(props: OpenMultiplyVaultState) {
  return (
    <OpenMultiplyVaultContainer
      header={
        <>
          <VaultHeading />
          <DefaultVaultHeader {...props} />
        </>
      }
      details={<DefaultOpenMultiplyVaultDetails {...props} />}
      form={<DefaultOpenMultiplyVaultForm {...props} />}
      clear={props.clear}
    />
  )
}
