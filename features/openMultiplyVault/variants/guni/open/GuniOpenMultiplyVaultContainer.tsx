import { GuniVaultHeader } from 'features/openMultiplyVault/variants/guni/GuniVaultHeader'
import { GuniOpenMultiplyVaultDetails } from 'features/openMultiplyVault/variants/guni/open/GuniOpenMultiplyVaultDetails'
import { GuniOpenMultiplyVaultForm } from 'features/openMultiplyVault/variants/guni/open/GuniOpenMultiplyVaultForm'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { OpenGuniVaultState } from '../../../../openGuniVault/openGuniVault'
import { OpenMultiplyVaultContainer } from '../../../common/OpenMultiplyVaultContainer'

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
