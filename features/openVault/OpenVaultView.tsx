import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { getToken } from 'blockchain/tokensMetadata'
import { UrgentAnnouncement } from 'components/Announcement'
import { useAppContext } from 'components/AppContextProvider'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { unhandledCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Card, Divider, Flex, Grid, Heading, SxProps, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'
import { OpenVaultAllowance, OpenVaultAllowanceStatus } from './OpenVaultAllowance'
import { createOpenVaultAnalytics$ } from './openVaultAnalytics'
import { OpenVaultButton } from './OpenVaultButton'
import { FormStage, getFormStage, getFormStage_ } from './openVaultConditions'
import { OpenVaultConfirmation, OpenVaultStatus } from './OpenVaultConfirmation'
import { OpenVaultDetails } from './OpenVaultDetails'
import { OpenVaultEditing } from './OpenVaultEditing'
import { OpenVaultErrors } from './OpenVaultErrors'
import { OpenVaultIlkDetails } from './OpenVaultIlkDetails'
import { OpenVaultProxy } from './OpenVaultProxy'
import { OpenVaultWarnings } from './OpenVaultWarnings'

function getTitle(state: OpenVaultState) {
  const { t } = useTranslation()
  const stage = getFormStage_(state)

  switch (stage) {
    case FormStage.CHOOSE_VAULT_TYPE:
      return 'CHOOSE'
    case FormStage.EDITING:
      return t('vault-form.header.edit')
    case FormStage.ALLOWANCE:
      return t('vault-form.header.allowance', { token: state.token.toUpperCase() })
    case FormStage.PROXY:
      return t('vault-form.header.proxy')
    case FormStage.RECEIPT:
      return t('vault-form.header.confirm')
    default:
      return unhandledCaseError(stage)
  }
}

function getSubtext(state: OpenVaultState) {
  const { t } = useTranslation()
  const stage = getFormStage_(state)

  switch (stage) {
    case FormStage.CHOOSE_VAULT_TYPE:
      return 'Choose subtext'
    case FormStage.EDITING:
      return t('vault-form.subtext.edit')
    case FormStage.ALLOWANCE:
      return t('vault-form.subtext.allowance', { token: state.token.toUpperCase() })
    case FormStage.PROXY:
      return t('vault-form.subtext.proxy')
    case FormStage.RECEIPT:
      return t('vault-form.subtext.confirm')
    default:
      return unhandledCaseError(stage)
  }
}
function OpenVaultTitle(props: OpenVaultState) {
  const title = getTitle(props)
  const subtext = getSubtext(props)

  return (
    <Box>
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
        {title}
      </Text>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {subtext}
      </Text>
    </Box>
  )
}

function OpenVaultForm(props: OpenVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage } = getFormStage(props)

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
          {isProxyStage && <OpenVaultProxy {...props} />}
          {isAllowanceStage && <OpenVaultAllowanceStatus {...props} />}
          {isOpenStage && <OpenVaultStatus {...props} />}
          <OpenVaultIlkDetails {...props} />
        </Grid>
      </Card>
    </Box>
  )
}

export function OpenVaultHeading(props: OpenVaultState & SxProps) {
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

export function OpenVaultContainer(props: OpenVaultState) {
  return (
    <Grid columns={['1fr', '2fr minmax(380px, 1fr)']} gap={5}>
      <OpenVaultHeading {...props} sx={{ display: ['block', 'none'] }} />
      <Box sx={{ order: [3, 1] }}>
        <OpenVaultDetails {...props} />
      </Box>
      <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} />
      <Box sx={{ order: [1, 2] }}>
        <OpenVaultForm {...props} />
      </Box>
    </Grid>
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
      <UrgentAnnouncement />
      <WithLoadingIndicator
        {...openVaultWithError}
        customError={<Box>{openVaultWithError.error?.message}</Box>}
      >
        {(openVault) => <OpenVaultContainer {...openVault} />}
      </WithLoadingIndicator>
    </Grid>
  )
}
