import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { VaultAllowance, VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultFormVaultTypeSwitch, WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultHeader } from 'components/vault/VaultHeader'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Container, Grid, Text } from 'theme-ui'

import { OpenMultiplyVaultState } from '../openMultiplyVault'
import { createOpenMultiplyVaultAnalytics$ } from '../openMultiplyVaultAnalytics'
import { OpenMultiplyVaultButton } from './OpenMultiplyVaultButton'
import {
  OpenMultiplyVaultConfirmation,
  OpenMultiplyVaultStatus,
} from './OpenMultiplyVaultConfirmation'
import { OpenMultiplyVaultDetails } from './OpenMultiplyVaultDetails'
import { OpenMultiplyVaultEditing } from './OpenMultiplyVaultEditing'
import { OpenMultiplyVaultErrors } from './OpenMultiplyVaultErrors'
import { OpenMultiplyVaultWarnings } from './OpenMultiplyVaultWarnings'

function OpenMultiplyVaultTitle({
  isEditingStage,
  isProxyStage,
  isAllowanceStage,
  token,
  totalSteps,
  currentStep,
  stage,
}: OpenMultiplyVaultState) {
  const { t } = useTranslation()
  return (
    <Box>
      <WithVaultFormStepIndicator {...{ totalSteps, currentStep }}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
          {isEditingStage
            ? t('vault-form.header.edit')
            : isProxyStage
            ? t('vault-form.header.proxy')
            : isAllowanceStage
            ? t('vault-form.header.allowance', { token: token.toUpperCase() })
            : stage === 'openInProgress'
            ? t('vault-form.header.confirm-in-progress')
            : t('vault-form.header.confirm')}
        </Text>
      </WithVaultFormStepIndicator>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {isEditingStage
          ? t('vault-form.subtext.edit')
          : isProxyStage
          ? t('vault-form.subtext.proxy')
          : isAllowanceStage
          ? t('vault-form.subtext.allowance')
          : stage === 'openInProgress'
          ? t('vault-form.subtext.confirm-in-progress')
          : t('vault-form.subtext.confirm')}
      </Text>
    </Box>
  )
}

function OpenMultiplyVaultForm(props: OpenMultiplyVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage, ilk } = props

  return (
    <VaultFormContainer toggleTitle="Open Vault">
      <OpenMultiplyVaultTitle {...props} />
      {isEditingStage && <OpenMultiplyVaultEditing {...props} />}
      {isAllowanceStage && <VaultAllowance {...props} />}
      {isOpenStage && <OpenMultiplyVaultConfirmation {...props} />}
      <OpenMultiplyVaultErrors {...props} />
      <OpenMultiplyVaultWarnings {...props} />
      <OpenMultiplyVaultButton {...props} />
      {isProxyStage && <VaultProxyStatusCard {...props} />}
      {isAllowanceStage && <VaultAllowanceStatus {...props} />}
      {isOpenStage && <OpenMultiplyVaultStatus {...props} />}
      {isEditingStage ? (
        <VaultFormVaultTypeSwitch href={`/vaults/open/${ilk}`} title="Switch to Borrow" />
      ) : null}
    </VaultFormContainer>
  )
}

export function OpenMultiplyVaultContainer(props: OpenMultiplyVaultState) {
  const { ilk, clear } = props
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  return (
    <>
      <VaultHeader {...props} header={t('vault.open-vault', { ilk })} />
      <Grid variant="vaultContainer">
        <Box>
          <OpenMultiplyVaultDetails {...props} />
        </Box>
        <Box>
          <OpenMultiplyVaultForm {...props} />
        </Box>
      </Grid>
    </>
  )
}

export function OpenMultiplyVaultView({ ilk }: { ilk: string }) {
  const { openMultiplyVault$, accountData$ } = useAppContext()
  const multiplyVaultWithIlk$ = openMultiplyVault$(ilk)

  const openVaultWithError = useObservableWithError(openMultiplyVault$(ilk))

  useEffect(() => {
    const subscription = createOpenMultiplyVaultAnalytics$(
      accountData$,
      multiplyVaultWithIlk$,
      trackingEvents,
    ).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithLoadingIndicator
      {...openVaultWithError}
      customError={<Box>{openVaultWithError.error?.message}</Box>}
      customLoader={<VaultContainerSpinner />}
    >
      {(openVault) => (
        <Container variant="vaultPageContainer">
          <OpenMultiplyVaultContainer {...openVault} />
        </Container>
      )}
    </WithLoadingIndicator>
  )
}
