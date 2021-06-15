import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Card, Flex, Grid, Heading, SxProps, Text } from 'theme-ui'

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
      {isEditingStage ? (
        <>
          <Box
            sx={{
              borderBottom: 'light',
              pb: 3,
              mb: 3,
              position: 'relative',
              width: 'calc(100% + 64px)',
              left: -4,
            }}
          >
            <AppLink
              href="/"
              sx={{
                color: 'primary',
                fontWeight: 'semiBold',
                fontSize: 3,
                pb: 2,
                display: 'block',
              }}
            >
              <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text mr={2}>Switch to Borrow</Text>
                <Icon sx={{ ml: 1 }} name="arrow_right" />
              </Flex>
            </AppLink>
          </Box>
          {/* divider */}
          <Box sx={{ pb: 2 }} />
        </>
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

function LeverageVaultForm(props: LeverageVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage } = props

  return (
    <Box>
      <Card
        variant="surface"
        sx={{ boxShadow: 'card', borderRadius: 'mediumLarge', p: 3, overflow: 'hidden' }}
      >
        <Grid gap={4} p={2}>
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
        </Grid>
      </Card>
    </Box>
  )
}

export function LeverageVaultHeading(props: LeverageVaultState & SxProps) {
  const { ilk, sx } = props
  const { t } = useTranslation()

  return (
    <Grid mt={4}>
      <Heading
        as="h1"
        variant="heading1"
        sx={{
          fontWeight: 'semiBold',
          pb: 2,
          ...sx,
        }}
      >
        {t('vault.open-vault', { ilk })}
      </Heading>
      <LeverageVaultIlkDetails {...props} />
    </Grid>
  )
}

export function LeverageVaultContainer(props: LeverageVaultState) {
  return (
    <>
      <LeverageVaultHeading {...props} />
      <Grid columns={['1fr', '2fr minmax(480px, 1fr)']} gap={4}>
        <Box sx={{ order: [3, 1] }}>
          <LeverageVaultDetails {...props} />
        </Box>
        {/* <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} /> */}
        <Box sx={{ order: [1, 2], pl: [0, 3] }}>
          <LeverageVaultForm {...props} />
        </Box>
      </Grid>
    </>
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
