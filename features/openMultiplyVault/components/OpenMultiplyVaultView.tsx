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
import { Box, Card, Grid, Text } from 'theme-ui'

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
  ilk,
}: OpenMultiplyVaultState) {
  const { t } = useTranslation()
  return (
    <Box>
      {isEditingStage ? (
        <VaultFormHeaderSwitch href={`/vaults/open/${ilk}`} title="Switch to Borrow" />
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

function OpenMultiplyVaultForm(props: OpenMultiplyVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage } = props

  return (
    <Card variant="vaultFormContainer">
      <Grid gap={4} p={2}>
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
      </Grid>
    </Card>
  )
}

export function OpenMultiplyVaultContainer(props: OpenMultiplyVaultState) {
  const { ilk } = props
  const { t } = useTranslation()

  return (
    <>
      <VaultHeader {...props} header={t('vault.open-vault', { ilk })} />
      <Grid variant="vaultContainer">
        <Box sx={{ order: [3, 1] }}>
          <OpenMultiplyVaultDetails {...props} />
        </Box>
        {/* <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} /> */}
        <Box sx={{ order: [1, 2], pl: [0, 3] }}>
          <OpenMultiplyVaultForm {...props} />
        </Box>
      </Grid>
    </>
  )
}

export function OpenMultiplyVaultView({ ilk }: { ilk: string }) {
  const { multiplyVault$, accountData$ } = useAppContext()
  const multiplyVaultWithIlk$ = multiplyVault$(ilk)

  const openVaultWithError = useObservableWithError(multiplyVault$(ilk))

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
    <Grid sx={{ width: '100%', zIndex: 1 }}>
      <WithLoadingIndicator
        {...openVaultWithError}
        customError={<Box>{openVaultWithError.error?.message}</Box>}
      >
        {(openVault) => <OpenMultiplyVaultContainer {...openVault} />}
      </WithLoadingIndicator>
    </Grid>
  )
}
