import { OpenMultiplyVaultButton } from 'components/vault/commonMultiply/OpenMultiplyVaultButton'
import {
  OpenMultiplyVaultConfirmation,
  OpenMultiplyVaultStatus,
} from 'components/vault/commonMultiply/OpenMultiplyVaultConfirmation'
import { OpenMultiplyVaultTitle } from 'components/vault/commonMultiply/OpenMultiplyVaultTitle'
import { VaultAllowance, VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyContentBox, VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { SidebarOpenGuniVault } from 'features/earn/guni/open/containers/sidebar/SidebarOpenGuniVault'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

import { OpenGuniVaultState } from '../pipes/openGuniVault'
import { GuniOpenMultiplyVaultChangesInformation } from './GuniOpenMultiplyVaultChangesInformation'
import { GuniOpenMultiplyVaultEditing } from './GuniOpenMultiplyVaultEditing'

export function GuniOpenMultiplyVaultForm(props: OpenGuniVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage, stage } = props
  const { t } = useTranslation()
  const gasData = extractGasDataFromState(props)
  const newComponentsEnabled = useFeatureToggle('NewComponents')

  return newComponentsEnabled ? (
    <SidebarOpenGuniVault {...props} />
  ) : (
    <VaultFormContainer toggleTitle={t('open-vault.title')}>
      <OpenMultiplyVaultTitle
        {...props}
        title={t('vault-form.header.editWithToken', { token: 'GUNI' })}
        subTitle={
          <Trans i18nKey="vault-form.subtext.edit-multiply-dai" values={{ token: 'GUNIV3DAIUSDC' }}>
            This vault can be created by simply <strong>depositing DAI</strong>. The transaction
            will create the GUNIV3DAIUSDC position for you based on this DAI deposit
          </Trans>
        }
        token="DAI"
      />
      {isProxyStage && <VaultProxyContentBox stage={stage} gasData={gasData} />}
      {isEditingStage && <GuniOpenMultiplyVaultEditing {...props} />}
      {isAllowanceStage && <VaultAllowance {...props} token="DAI" />}
      {isOpenStage && (
        <OpenMultiplyVaultConfirmation stage={props.stage}>
          <GuniOpenMultiplyVaultChangesInformation {...props} />
        </OpenMultiplyVaultConfirmation>
      )}
      <VaultErrors {...props} />
      <VaultWarnings {...props} />
      {stage === 'txSuccess' && <VaultChangesWithADelayCard />}
      <OpenMultiplyVaultButton {...props} token="DAI" />
      {isProxyStage && <VaultProxyStatusCard {...props} />}
      {isAllowanceStage && <VaultAllowanceStatus {...props} />}
      {isOpenStage && <OpenMultiplyVaultStatus {...props} />}
    </VaultFormContainer>
  )
}
