import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { VaultAllowance, VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultFormHeaderSwitch } from 'components/vault/VaultFormHeader'
import { VaultHeader } from 'components/vault/VaultHeader'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Card, Divider, Grid, Text } from 'theme-ui'

import { OpenVaultState } from '../openVault'
import { createOpenVaultAnalytics$ } from '../openVaultAnalytics'
import { OpenVaultButton } from './OpenVaultButton'
import { OpenVaultConfirmation, OpenVaultStatus } from './OpenVaultConfirmation'
import { OpenVaultDetails } from './OpenVaultDetails'
import { OpenVaultEditing } from './OpenVaultEditing'
import { OpenVaultErrors } from './OpenVaultErrors'
import { OpenVaultWarnings } from './OpenVaultWarnings'

function OpenVaultTitle({
  isEditingStage,
  isProxyStage,
  isAllowanceStage,
  token,
  ilk,
}: OpenVaultState) {
  const { t } = useTranslation()
  return (
    <Box>
      {isEditingStage ? (
        <VaultFormHeaderSwitch href={`/vaults/open-multiply/${ilk}`} title="Switch to Multiply" />
      ) : null}
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
        {isEditingStage
          ? t('vault-form.header.edit')
          : isProxyStage
          ? t('vault-form.header.proxy')
          : isAllowanceStage
          ? t('vault-form.header.allowance', { token: token.toUpperCase() })
          : t('vault-form.header.confirm')}
      </Text>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {isEditingStage
          ? t('vault-form.subtext.edit')
          : isProxyStage
          ? t('vault-form.subtext.proxy')
          : isAllowanceStage
          ? t('vault-form.subtext.allowance')
          : t('vault-form.subtext.confirm')}
      </Text>
    </Box>
  )
}

function OpenVaultForm(props: OpenVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage } = props

  return (
    <Card variant="vaultFormContainer">
      <Grid gap={4} p={2}>
        <OpenVaultTitle {...props} />
        {isEditingStage && <OpenVaultEditing {...props} />}
        {isAllowanceStage && <VaultAllowance {...props} />}
        {isOpenStage && <OpenVaultConfirmation {...props} />}
        <OpenVaultErrors {...props} />
        <OpenVaultWarnings {...props} />
        <OpenVaultButton {...props} />
        {isProxyStage && <VaultProxyStatusCard {...props} />}
        {isAllowanceStage && <VaultAllowanceStatus {...props} />}
        {isOpenStage && <OpenVaultStatus {...props} />}
      </Grid>
    </Card>
  )
}

export function OpenVaultContainer(props: OpenVaultState) {
  const { ilk } = props
  const { t } = useTranslation()

  return (
    <>
      <VaultHeader {...props} header={t('vault.open-vault', { ilk })} />
      <Grid variant="vaultContainer">
        <Box sx={{ order: [3, 1] }}>
          <OpenVaultDetails {...props} />
        </Box>
        <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} />
        <Box sx={{ order: [1, 2] }}>
          <OpenVaultForm {...props} />
        </Box>
      </Grid>
    </>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$, accountData$ } = useAppContext()
  const openVaultWithIlk$ = openVault$(ilk)

  const openVaultWithError = useObservableWithError(openVault$(ilk))

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(
      accountData$,
      openVaultWithIlk$,
      trackingEvents,
    ).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Grid sx={{ width: '100%', zIndex: 1 }}>
      <WithLoadingIndicator
        {...openVaultWithError}
        customError={<Box>{openVaultWithError.error?.message}</Box>}
      >
        {(openVault) => <OpenVaultContainer {...openVault} />}
      </WithLoadingIndicator>
    </Grid>
  )
}
