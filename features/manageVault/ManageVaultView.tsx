import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { ManageVaultFormHeader } from 'features/manageVault/ManageVaultFormHeader'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Divider, Flex, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'
import { createManageVaultAnalytics$ } from './manageVaultAnalytics'
import { ManageVaultButton } from './ManageVaultButton'
import { ManageVaultCollateralAllowance } from './ManageVaultCollateralAllowance'
import { ManageVaultConfirmation, ManageVaultConfirmationStatus } from './ManageVaultConfirmation'
import { ManageVaultDaiAllowance } from './ManageVaultDaiAllowance'
import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageVaultEditing } from './ManageVaultEditing'
import { ManageVaultErrors } from './ManageVaultErrors'
import { ManageVaultWarnings } from './ManageVaultWarnings'

function TextWithCheckmark({ children }: WithChildren) {
  return (
    <Flex sx={{ alignItems: 'center' }}>
      <Flex
        sx={{
          width: '20px',
          height: '20px',
          border: '2px solid',
          borderColor: 'onSuccess',
          borderRadius: '50%',
          mr: 3,
          alignItems: 'center',
          justifyContent: 'center',
          color: 'onSuccess',
          flexShrink: 0,
        }}
      >
        <Icon name="checkmark" size="auto" width="11px" sx={{ position: 'relative', top: '1px' }} />
      </Flex>
      <Text>{children}</Text>
    </Flex>
  )
}

function ManageVaultMultiplyTransition({ stage, vault }: ManageVaultState) {
  const { t } = useTranslation()
  return stage === 'multiplyTransitionEditing' ? (
    <Grid mt={-3}>
      <Grid variant="text.paragraph3" sx={{ color: 'text.subtitle' }}>
        <TextWithCheckmark>
          {t('vault-form.subtext.checkmark1', { token: vault.token.toUpperCase() })}
        </TextWithCheckmark>
        <TextWithCheckmark>{t('vault-form.subtext.checkmark2')}</TextWithCheckmark>
        <TextWithCheckmark>{t('vault-form.subtext.checkmark3')}</TextWithCheckmark>
        <TextWithCheckmark>{t('vault-form.subtext.checkmark4')}</TextWithCheckmark>
      </Grid>
      <Divider />
      <Grid gap={2}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
          {t('vault-form.subtext.subheader2')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'text.subtitle' }}>
          {t('vault-form.subtext.paragraph2')}
        </Text>
      </Grid>
    </Grid>
  ) : (
    <Box>
      <Icon name="multiply_transition" size="auto" width="420" height="219" />
    </Box>
  )
}

function ManageVaultForm(props: ManageVaultState) {
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
    isMultiplyTransitionStage,
    accountIsConnected,
    daiAllowanceTxHash,
    collateralAllowanceTxHash,
    vault: { token },
    stage,
  } = props

  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      <ManageVaultFormHeader {...props} />
      {isEditingStage && <ManageVaultEditing {...props} />}
      {isCollateralAllowanceStage && <ManageVaultCollateralAllowance {...props} />}
      {isDaiAllowanceStage && <ManageVaultDaiAllowance {...props} />}
      {isManageStage && <ManageVaultConfirmation {...props} />}
      {isMultiplyTransitionStage && <ManageVaultMultiplyTransition {...props} />}
      {accountIsConnected && (
        <>
          <ManageVaultErrors {...props} />
          <ManageVaultWarnings {...props} />
          {stage === 'manageSuccess' && <VaultChangesWithADelayCard />}
          <ManageVaultButton {...props} />
        </>
      )}
      {isProxyStage && <VaultProxyStatusCard {...props} />}
      {isCollateralAllowanceStage && (
        <VaultAllowanceStatus
          {...props}
          allowanceTxHash={collateralAllowanceTxHash}
          token={token}
        />
      )}
      {isDaiAllowanceStage && (
        <VaultAllowanceStatus {...props} allowanceTxHash={daiAllowanceTxHash} token={'DAI'} />
      )}
      {isManageStage && <ManageVaultConfirmationStatus {...props} />}
    </VaultFormContainer>
  )
}

export function ManageVaultContainer({
  manageVault,
  vaultHistory,
}: {
  manageVault: ManageVaultState
  vaultHistory: VaultHistoryEvent[]
}) {
  const { manageVault$, context$ } = useAppContext()
  const {
    vault: { id, ilk },
    clear,
  } = manageVault
  const { t } = useTranslation()

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <DefaultVaultHeader {...manageVault} header={t('vault.header', { ilk, id })} id={id} />
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageVaultDetails {...manageVault} />
          <VaultHistoryView vaultHistory={vaultHistory} />
        </Grid>
        <Box>
          <ManageVaultForm {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
