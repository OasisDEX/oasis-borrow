import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { VaultHeader } from 'components/vault/VaultHeader'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Card, Divider, Grid, Text } from 'theme-ui'

import { OpenVaultState } from '../openVault'
import { createOpenVaultAnalytics$ } from '../openVaultAnalytics'
import { OpenVaultAllowance, OpenVaultAllowanceStatus } from './OpenVaultAllowance'
import { OpenVaultButton } from './OpenVaultButton'
import { OpenVaultConfirmation, OpenVaultStatus } from './OpenVaultConfirmation'
import { OpenVaultDetails } from './OpenVaultDetails'
import { OpenVaultEditing } from './OpenVaultEditing'
import { OpenVaultErrors } from './OpenVaultErrors'
import { OpenVaultWarnings } from './OpenVaultWarnings'

function OpenVaultTitle({ isEditingStage, isProxyStage, isAllowanceStage, token }: OpenVaultState) {
  const { t } = useTranslation()
  return (
    <Box>
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
    <Box>
      <Card variant="surface" sx={{ boxShadow: 'card', borderRadius: 'mediumLarge', px: 4, py: 3 }}>
        <Grid sx={{ mt: 2 }}>
          <OpenVaultTitle {...props} />
          {isEditingStage && <OpenVaultEditing {...props} />}
          {isAllowanceStage && <OpenVaultAllowance {...props} />}
          {isOpenStage && <OpenVaultConfirmation {...props} />}
          <OpenVaultErrors {...props} />
          <OpenVaultWarnings {...props} />
          <OpenVaultButton {...props} />
          {isProxyStage && <VaultProxyStatusCard {...props} />}
          {isAllowanceStage && <OpenVaultAllowanceStatus {...props} />}
          {isOpenStage && <OpenVaultStatus {...props} />}
        </Grid>
      </Card>
    </Box>
  )
}

export function OpenVaultContainer(props: OpenVaultState) {
  const { ilk } = props
  const { t } = useTranslation()

  return (
    <>
      <VaultHeader {...{ ...props, header: t('vault.open-vault', { ilk }) }} />
      <Grid columns={['1fr', '2fr minmax(380px, 1fr)']} gap={5}>
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
  const { openVault$ } = useAppContext()
  const openVaultWithIlk$ = openVault$(ilk)

  const openVaultWithError = useObservableWithError(openVault$(ilk))

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(openVaultWithIlk$, trackingEvents).subscribe()

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
