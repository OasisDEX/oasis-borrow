import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Divider, Flex, Grid, Heading, Spinner, SxProps, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'
import { OpenVaultAllowance } from './OpenVaultAllowance'
import { OpenVaultButton } from './OpenVaultButton'
import { OpenVaultConfirmation } from './OpenVaultConfirmation'
import { OpenVaultDetails } from './OpenVaultDetails'
import { OpenVaultEditing } from './OpenVaultEditing'
import { OpenVaultIlkDetails } from './OpenVaultIlkDetails'
import { OpenVaultProxy } from './OpenVaultProxy'

function OpenVaultErrors({ errorMessages }: OpenVaultState) {
  const errorString = errorMessages.join(',\n')
  if (!errorString) return null
  return (
    <Card variant="danger">
      <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
    </Card>
  )
}

function OpenVaultWarnings({ warningMessages }: OpenVaultState) {
  const warningString = warningMessages.join(',\n')
  if (!warningString) return null
  return (
    <Card variant="warning">
      <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onWarning' }}>{warningString}</Text>
    </Card>
  )
}

function OpenVaultTitle({ isEditingStage, isProxyStage, isAllowanceStage }: OpenVaultState) {
  const { t } = useTranslation();
  return (
    <Box>
      <Text variant="paragraph2" sx={{fontWeight: 'semiBold', mb: 1}}>
        {isEditingStage
          ? t('vault-form.header.edit')
          : isProxyStage
          ? t('vault-form.header.proxy')
          : isAllowanceStage
          ? t('vault-form.header.allowance')
          : t('vault-form.header.confirm')
        }
      </Text>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle' }}>
      {isEditingStage
          ? t('vault-form.subtext.edit')
          : isProxyStage
          ? t('vault-form.subtext.proxy')
          : isAllowanceStage
          ? t('vault-form.subtext.allowance')
          : t('vault-form.subtext.confirm')
        }
      </Text>
    </Box>
  )
}

function OpenVaultForm(props: OpenVaultState) {
  const {
    toggleIlkDetails,
    showIlkDetails,
    isEditingStage,
    isProxyStage,
    isAllowanceStage,
    isOpenStage,
  } = props
  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    if (isEditingStage && !showIlkDetails) {
      toggleIlkDetails!()
    }
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    if (isEditingStage && showIlkDetails) {
      toggleIlkDetails!()
    }
  }

  return (
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Card sx={{ boxShadow: 'card', borderRadius: 'mediumLarge'}}>
        <Grid>
          <OpenVaultTitle {...props} />
          {isEditingStage && <OpenVaultEditing {...props} />}
          {isProxyStage && <OpenVaultProxy {...props} />}
          {isAllowanceStage && <OpenVaultAllowance {...props} />}
          {isOpenStage && <OpenVaultConfirmation {...props} />}
          <OpenVaultErrors {...props} />
          <OpenVaultWarnings {...props} />
          <OpenVaultButton {...props} />
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
    <Grid columns={['1fr', '2fr 1fr']} gap={4}>
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
  const [openVault, openVaultError] = useObservableWithError(openVault$(ilk))

  if (openVaultError) {
    return (
      <Grid
        sx={{
          width: '100%',
          height: '50vh',
          justifyItems: 'center',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        <Box>{openVaultError.message}</Box>
      </Grid>
    )
  }

  if (!openVault) {
    return (
      <Grid
        sx={{
          position: 'absolute',
          width: '100%',
          height: '50vh',
          justifyItems: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner size={50} />
      </Grid>
    )
  }

  return (
    <Grid sx={{ width: '100%', zIndex: 1 }}>
      <OpenVaultContainer {...(openVault as OpenVaultState)} />
    </Grid>
  )
}
