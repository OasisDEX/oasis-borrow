import { OpenMultiplyVaultButton } from 'components/vault/commonMultiply/OpenMultiplyVaultButton'
import {
  OpenMultiplyVaultConfirmation,
  OpenMultiplyVaultStatus,
} from 'components/vault/commonMultiply/OpenMultiplyVaultConfirmation'
import { OpenMultiplyVaultTitle } from 'components/vault/commonMultiply/OpenMultiplyVaultTitle'
import { VaultAllowance, VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultFormVaultTypeSwitch } from 'components/vault/VaultForm'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyContentBox, VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { OpenMultiplyVaultState } from '../pipes/openMultiplyVault'
import { OpenMultiplyVaultChangesInformation } from './OpenMultiplyVaultChangesInformation'
import { OpenMultiplyVaultEditing } from './OpenMultiplyVaultEditing'
import { SidebarOpenMultiplyVault } from './sidebar/SidebarOpenMultiplyVault'

export function OpenMultiplyVaultForm(props: OpenMultiplyVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage, ilk, stage } = props
  const { t } = useTranslation()
  const gasData = extractGasDataFromState(props)
  const newComponentsEnabled = useFeatureToggle('NewComponents')

  return newComponentsEnabled ? (
    <SidebarOpenMultiplyVault {...props} />
  ) : (
    <VaultFormContainer toggleTitle="Open Vault">
      <OpenMultiplyVaultTitle
        {...props}
        title={t('vault-form.header.edit')}
        subTitle={t('vault-form.subtext.edit-multiply')}
      />
      {isProxyStage && <VaultProxyContentBox stage={stage} gasData={gasData} />}
      {isEditingStage && <OpenMultiplyVaultEditing {...props} />}
      {isAllowanceStage && <VaultAllowance {...props} />}
      {isOpenStage && (
        <OpenMultiplyVaultConfirmation stage={props.stage}>
          <OpenMultiplyVaultChangesInformation {...props} />
        </OpenMultiplyVaultConfirmation>
      )}
      <VaultErrors {...props} />
      <VaultWarnings {...props} />
      {stage === 'txSuccess' && <VaultChangesWithADelayCard />}
      <OpenMultiplyVaultButton {...props} />
      {isProxyStage && <VaultProxyStatusCard {...props} />}
      {isAllowanceStage && <VaultAllowanceStatus {...props} />}
      {isOpenStage && <OpenMultiplyVaultStatus {...props} />}
      {isEditingStage ? (
        <VaultFormVaultTypeSwitch
          href={`/vaults/open/${ilk}`}
          title="Switch to Borrow"
          visible={true}
        />
      ) : null}
    </VaultFormContainer>
  )
}
