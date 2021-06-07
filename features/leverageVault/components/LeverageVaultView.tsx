import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Card, Divider, Flex, Grid, Heading, SxProps, Text } from 'theme-ui'

import { LeverageVaultState } from '../leverageVault'
import { createOpenVaultAnalytics$ } from '../leverageVaultAnalytics'
import { LeverageVaultAllowance, LeverageVaultAllowanceStatus } from './LeverageVaultAllowance'
import { LeverageVaultButton } from './LeverageVaultButton'
import { LeverageVaultConfirmation, LeverageVaultStatus } from './LeverageVaultConfirmation'
import { LeverageVaultDetails } from './LeverageVaultDetails'
import { LeverageVaultEditing } from './LeverageVaultEditing'
import { LeverageVaultErrors } from './LeverageVaultErrors'
import { LeverageVaultIlkDetails } from './LeverageVaultIlkDetails'
import { LeverageVaultProxy } from './LeverageVaultProxy'
import { LeverageVaultWarnings } from './LeverageVaultWarnings'

function LeverageVaultTitle({
  isEditingStage,
  isProxyStage,
  isAllowanceStage,
  token,
}: LeverageVaultState) {
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

function LeverageVaultForm(props: LeverageVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage } = props

  return (
    <Box>
      <Card variant="surface" sx={{ boxShadow: 'card', borderRadius: 'mediumLarge', px: 4, py: 3 }}>
        <Grid sx={{ mt: 2 }}>
          <LeverageVaultTitle {...props} />
          {isEditingStage && <LeverageVaultEditing {...props} />}
          {isAllowanceStage && <LeverageVaultAllowance {...props} />}
          {isOpenStage && <LeverageVaultConfirmation {...props} />}
          <LeverageVaultErrors {...props} />
          <LeverageVaultWarnings {...props} />
          <LeverageVaultButton {...props} />
          {isProxyStage && <LeverageVaultProxy {...props} />}
          {isAllowanceStage && <LeverageVaultAllowanceStatus {...props} />}
          {isOpenStage && <LeverageVaultStatus {...props} />}
          <LeverageVaultIlkDetails {...props} />
        </Grid>
      </Card>
    </Box>
  )
}

export function LeverageVaultHeading(props: LeverageVaultState & SxProps) {
  const { token, ilk, sx } = props
  const tokenInfo = getToken(token)
  const { t } = useTranslation()

  return (
    <Heading
      as="h1"
      variant="paragraph2"
      sx={{
        gridColumn: ['1', '1/3'],
        fontWeight: 'semiBold',
        borderBottom: 'light',
        pb: 3,
        ...sx,
      }}
    >
      <Flex sx={{ justifyContent: ['center', 'left'] }}>
        <Icon name={tokenInfo.iconCircle} size="26px" sx={{ verticalAlign: 'sub', mr: 2 }} />
        <Text>{t('vault.open-vault', { ilk })}</Text>
      </Flex>
    </Heading>
  )
}

export function LeverageVaultContainer(props: LeverageVaultState) {
  return (
    <Grid columns={['1fr', '2fr minmax(380px, 1fr)']} gap={5}>
      <LeverageVaultHeading {...props} sx={{ display: ['block', 'none'] }} />
      <Box sx={{ order: [3, 1] }}>
        <LeverageVaultDetails {...props} />
      </Box>
      <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} />
      <Box sx={{ order: [1, 2] }}>
        <LeverageVaultForm {...props} />
      </Box>
    </Grid>
  )
}

export function LeverageVaultView({ ilk }: { ilk: string }) {
  const { leverageVault$ } = useAppContext()
  const leverageVaultWithIlk$ = leverageVault$(ilk)

  const openVaultWithError = useObservableWithError(leverageVault$(ilk))

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(
      leverageVaultWithIlk$,
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
        {(openVault) => <LeverageVaultContainer {...openVault} />}
      </WithLoadingIndicator>
    </Grid>
  )
}
