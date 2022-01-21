import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { GuniOpenMultiplyVaultDetails } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultDetails'
import { GuniOpenMultiplyVaultForm } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultForm'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { OpenMultiplyVaultContainer } from '../../../../../components/vault/commonMultiply/OpenMultiplyVaultContainer'
import { OpenGuniVaultState } from '../pipes/openGuniVault'

export function GuniOpenMultiplyVaultContainer(props: OpenGuniVaultState) {
  const { t } = useTranslation()

  return (
    <OpenMultiplyVaultContainer
      header={<GuniVaultHeader {...props} header={t('vault.open-vault', { ilk: props.ilk })} />}
      details={<GuniOpenMultiplyVaultDetails {...props} />}
      form={<GuniOpenMultiplyVaultForm {...props} />}
      clear={props.clear}
    />
  )
}
