import { useTranslation } from 'next-i18next'
import React from 'react'

import { DefaultVaultHeader } from '../../../../../components/vault/DefaultVaultHeader'
import { OpenMultiplyVaultContainer } from '../../../common/OpenMultiplyVaultContainer'
import { OpenMultiplyVaultState } from '../../../openMultiplyVault'
import { DefaultOpenMultiplyVaultDetails } from './DefaultOpenMultiplyVaultDetails'
import { DefaultOpenMultiplyVaultForm } from './DefaultOpenMultiplyVaultForm'

export function DefaultOpenMultiplyVaultContainer(props: OpenMultiplyVaultState) {
  const { t } = useTranslation()

  return (
    <OpenMultiplyVaultContainer
      header={<DefaultVaultHeader {...props} header={t('vault.open-vault', { ilk: props.ilk })} />}
      details={<DefaultOpenMultiplyVaultDetails {...props} />}
      form={<DefaultOpenMultiplyVaultForm {...props} />}
      clear={props.clear}
    />
  )
}
