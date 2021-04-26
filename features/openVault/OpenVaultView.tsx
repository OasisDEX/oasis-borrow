import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Card, Divider, Flex, Grid, Heading, Spinner, SxProps, Text } from 'theme-ui'

import { categoriseOpenVaultStage, OpenVaultState } from './openVault'
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

function OpenVaultTitle({
  reset,
  stage,
  isEditingStage,
  isProxyStage,
  isAllowanceStage,
}: OpenVaultState) {
  const canReset = !!reset

  function handleReset(e: React.SyntheticEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (canReset) reset!()
  }

  return (
    <Grid>
      <Grid columns="2fr 1fr">
        <Text>
          {isEditingStage
            ? 'Configure your Vault'
            : isProxyStage
            ? 'Create Proxy'
            : isAllowanceStage
            ? 'Set Allowance'
            : 'Create your Vault'}
        </Text>
        {canReset ? (
          <Button onClick={handleReset} disabled={!canReset} sx={{ fontSize: 1, p: 0 }}>
            {stage === 'editing' ? 'Reset' : 'Back'}
          </Button>
        ) : null}
      </Grid>
      <Text sx={{ fontSize: 2 }}>
        Some text here giving a little more context as to what the user is doing
      </Text>
    </Grid>
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
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} sx={{ order: [1, 2] }}>
      <Card sx={{ border: ['none', '1px solid'], borderColor: ['none', 'light'] }}>
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
      <OpenVaultDetails {...props} />
      <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} />
      <OpenVaultForm {...props} />
    </Grid>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$ } = useAppContext()
  const [openVault, openVaultError] = useObservableWithError(openVault$(ilk))

  if (openVaultError) {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        <Box>{openVaultError.message}</Box>
      </Grid>
    )
  }

  if (!openVault) {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
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
