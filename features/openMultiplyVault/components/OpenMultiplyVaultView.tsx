import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Card, Flex, Grid, Heading, SxProps, Text } from 'theme-ui'

import { OpenMultiplyVaultState } from '../openMultiplyVault'
import { createOpenVaultAnalytics$ } from '../openMultiplyVaultAnalytics'
import {
  OpenMultiplyVaultAllowance,
  OpenMultiplyVaultAllowanceStatus,
} from './OpenMultiplyVaultAllowance'
import { OpenMultiplyVaultButton } from './OpenMultiplyVaultButton'
import {
  OpenMultiplyVaultConfirmation,
  OpenMultiplyVaultStatus,
} from './OpenMultiplyVaultConfirmation'
import { OpenMultiplyVaultDetails } from './OpenMultiplyVaultDetails'
import { OpenMultiplyVaultEditing } from './OpenMultiplyVaultEditing'
import { OpenMultiplyVaultErrors } from './OpenMultiplyVaultErrors'
import { OpenMultiplyVaultIlkDetails } from './OpenMultiplyVaultIlkDetails'
import { OpenMultiplyVaultProxy } from './OpenMultiplyVaultProxy'
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
        <>
          <Box
            sx={{
              borderBottom: 'lightMuted',
              pb: 3,
              mb: 3,
              position: 'relative',
              width: 'calc(100% + 64px)',
              left: -4,
            }}
          >
            <AppLink
              href={`/vaults/open/${ilk}`}
              sx={{
                color: 'primary',
                fontWeight: 'semiBold',
                fontSize: 3,
                pb: 2,
                display: 'block',
              }}
            >
              <Flex
                sx={{
                  variant: 'links.nav',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 3,
                }}
              >
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

function OpenMultiplyVaultForm(props: OpenMultiplyVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage } = props

  return (
    <Box>
      <Card
        variant="surface"
        sx={{
          boxShadow: 'card',
          borderRadius: 'mediumLarge',
          p: 3,
          overflow: 'hidden',
          border: 'lightMuted',
        }}
      >
        <Grid gap={4} p={2}>
          <OpenMultiplyVaultTitle {...props} />
          {isEditingStage && <OpenMultiplyVaultEditing {...props} />}
          {isAllowanceStage && <OpenMultiplyVaultAllowance {...props} />}
          {isOpenStage && <OpenMultiplyVaultConfirmation {...props} />}
          <OpenMultiplyVaultErrors {...props} />
          <OpenMultiplyVaultWarnings {...props} />
          <OpenMultiplyVaultButton {...props} />
          {isProxyStage && <OpenMultiplyVaultProxy {...props} />}
          {isAllowanceStage && <OpenMultiplyVaultAllowanceStatus {...props} />}
          {isOpenStage && <OpenMultiplyVaultStatus {...props} />}
        </Grid>
      </Card>
    </Box>
  )
}

export function OpenMultiplyVaultHeading(props: OpenMultiplyVaultState & SxProps) {
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
      <OpenMultiplyVaultIlkDetails {...props} />
    </Grid>
  )
}

export function OpenMultiplyVaultContainer(props: OpenMultiplyVaultState) {
  return (
    <>
      <OpenMultiplyVaultHeading {...props} />
      <Grid columns={['1fr', '2fr minmax(480px, 1fr)']} gap={4}>
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
  const { multiplyVault$ } = useAppContext()
  const multiplyVaultWithIlk$ = multiplyVault$(ilk)

  const openVaultWithError = useObservableWithError(multiplyVault$(ilk))

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(
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
