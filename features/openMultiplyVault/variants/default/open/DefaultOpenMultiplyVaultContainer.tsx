import React from 'react'

import { DefaultVaultHeader } from '../../../../../components/vault/DefaultVaultHeader'
import { OpenMultiplyVaultContainer } from '../../../common/OpenMultiplyVaultContainer'
import { OpenMultiplyVaultState } from '../../../openMultiplyVault'
import { DefaultOpenMultiplyVaultDetails } from './DefaultOpenMultiplyVaultDetails'
import { DefaultOpenMultiplyVaultForm } from './DefaultOpenMultiplyVaultForm'

// probably can be used in open / manage
export function DefaultOpenMultiplyVaultContainer(props: OpenMultiplyVaultState) {
  return (
    <OpenMultiplyVaultContainer
      {...props}
      header={DefaultVaultHeader}
      details={DefaultOpenMultiplyVaultDetails}
      form={DefaultOpenMultiplyVaultForm}
    />
  )
}
