import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { ManageVaultFormHeader } from 'features/manageVault/ManageVaultFormHeader'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Divider, Flex, Grid, Heading, SxProps, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'
import { ManageVaultButton } from './ManageVaultButton'
import { ManageVaultCollateralAllowance } from './ManageVaultCollateralAllowance'
import { ManageVaultConfirmation } from './ManageVaultConfirmation'
import { ManageVaultDaiAllowance } from './ManageVaultDaiAllowance'
import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageVaultEditing } from './ManageVaultEditing'
import { ManageVaultIlkDetails } from './ManageVaultIlkDetails'
import { ManageVaultProxy } from './ManageVaultProxy'

function ManageVaultErrors({ errorMessages }: ManageVaultState) {
  const errorString = errorMessages.join(',\n')
  if (!errorString) return null
  return (
    <Card variant="danger">
      <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onError' }}>{errorString}</Text>
    </Card>
  )
}

function ManageVaultWarnings({ warningMessages }: ManageVaultState) {
  const warningString = warningMessages.join(',\n')
  if (!warningString) return null
  return (
    <Card variant="warning">
      <Text sx={{ flexWrap: 'wrap', fontSize: 2, color: 'onWarning' }}>{warningString}</Text>
    </Card>
  )
}

function ManageVaultForm(props: ManageVaultState) {
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
    accountIsConnected,
  } = props

  return (
    <Box>
      <Card>
        <ManageVaultFormHeader {...props} />
        <Grid pb={3}>
          {isEditingStage && <ManageVaultEditing {...props} />}
          {isProxyStage && <ManageVaultProxy {...props} />}
          {isCollateralAllowanceStage && <ManageVaultCollateralAllowance {...props} />}
          {isDaiAllowanceStage && <ManageVaultDaiAllowance {...props} />}
          {isManageStage && <ManageVaultConfirmation {...props} />}
          {accountIsConnected && (
            <>
              <ManageVaultErrors {...props} />
              <ManageVaultWarnings {...props} />
              <ManageVaultButton {...props} />
            </>
          )}
          <ManageVaultIlkDetails {...props} />
        </Grid>
      </Card>
    </Box>
  )
}

export function ManageVaultHeading(props: ManageVaultState & SxProps) {
  const {
    vault: { id, ilk, token },
    sx,
  } = props
  const tokenInfo = getToken(token)
  const { t } = useTranslation()
  return (
    <Heading
      as="h1"
      variant="paragraph2"
      sx={{ gridColumn: ['1', '1/3'], fontWeight: 'semiBold', borderBottom: 'light', pb: 3, ...sx }}
    >
      <Flex sx={{ justifyContent: ['center', 'left'] }}>
        <Icon name={tokenInfo.iconCircle} size="26px" sx={{ verticalAlign: 'sub', mr: 2 }} />
        <Text>{t('vault.header', { ilk, id })}</Text>
      </Flex>
    </Heading>
  )
}

export function ManageVaultContainer(props: ManageVaultState) {
  return (
    <Grid columns={['1fr', '2fr 1fr']} gap={4}>
      <ManageVaultHeading {...props} sx={{ display: ['block', 'none'] }} />
      <Box sx={{ order: [3, 1] }}>
        <ManageVaultDetails {...props} />
      </Box>
      <Divider sx={{ display: ['block', 'none'], order: [2, 0] }} />
      <Box sx={{ order: [1, 2] }}>
        <ManageVaultForm {...props} />
      </Box>
    </Grid>
  )
}

export function ManageVaultView({ id }: { id: BigNumber }) {
  const { manageVault$ } = useAppContext()
  const manageVaultWithError = useObservableWithError(manageVault$(id))

  return (
    <WithLoadingIndicator
      {...manageVaultWithError}
      customLoader={<AppSpinner sx={{ mx: 'auto' }} variant="styles.spinner.large" />}
    >
      {(manageVault) => (
        <Grid sx={{ width: '100%', zIndex: 1 }}>
          <ManageVaultContainer {...manageVault} />
        </Grid>
      )}
    </WithLoadingIndicator>
  )
}
