import { VaultAllowance, VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultChangesWithADelayCard } from '../../../../../components/vault/VaultChangesWithADelayCard'
import { VaultProxyStatusCard } from '../../../../../components/vault/VaultProxy'
import { OpenMultiplyVaultButton } from '../../../common/OpenMultiplyVaultButton'
import {
  OpenMultiplyVaultConfirmation,
  OpenMultiplyVaultStatus,
} from '../../../common/OpenMultiplyVaultConfirmation'
import { OpenMultiplyVaultTitle } from '../../../common/OpenMultiplyVaultTitle'
import { VaultErrors } from '../../../common/VaultErrors'
import { VaultWarnings } from '../../../common/VaultWarnings'
import { OpenMultiplyVaultState } from '../../../openMultiplyVault'
import { GuniOpenMultiplyVaultEditing } from './GuniOpenMultiplyVaultEditing'

export function GuniOpenMultiplyVaultForm(props: OpenMultiplyVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage, stage } = props
  const { t } = useTranslation()

  return (
    <VaultFormContainer toggleTitle={t('open.vault.title')}>
      <OpenMultiplyVaultTitle
        {...props}
        title={t('vault-form.header.editWithToken', { token: 'GUNI' })}
        subTitle={t('vault-form.subtext.edit-multiply')}
      />
      {isEditingStage && <GuniOpenMultiplyVaultEditing {...props} />}
      {isAllowanceStage && <VaultAllowance {...props} />}
      {isOpenStage && <OpenMultiplyVaultConfirmation {...props} />}
      <VaultErrors {...props} />
      <VaultWarnings {...props} />
      {stage === 'openSuccess' && <VaultChangesWithADelayCard />}
      <OpenMultiplyVaultButton {...props} />
      {isProxyStage && <VaultProxyStatusCard {...props} />}
      {isAllowanceStage && <VaultAllowanceStatus {...props} />}
      {isOpenStage && <OpenMultiplyVaultStatus {...props} />}
    </VaultFormContainer>
  )
}
