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
import { slideInAnimation } from 'theme/animations'

import { ManageVaultState } from './manageVault'
import { ManageVaultButton } from './ManageVaultButton'
import {
  ManageVaultCollateralAllowance,
  ManageVaultCollateralAllowanceStatus,
} from './ManageVaultCollateralAllowance'
import { ManageVaultConfirmation, ManageVaultConfirmationStatus } from './ManageVaultConfirmation'
import { ManageVaultDaiAllowance, ManageVaultDaiAllowanceStatus } from './ManageVaultDaiAllowance'
import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageVaultEditing } from './ManageVaultEditing'
import { ManageVaultErrors } from './ManageVaultErrors'
import { ManageVaultIlkDetails } from './ManageVaultIlkDetails'
import { ManageVaultProxy } from './ManageVaultProxy'
import { ManageVaultWarnings } from './ManageVaultWarnings'

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
      <Card variant="surface" sx={{ boxShadow: 'card', borderRadius: 'mediumLarge', px: 4, py: 3 }}>
        <Grid sx={{ mt: 2 }}>
          <ManageVaultFormHeader {...props} />
          {isEditingStage && <ManageVaultEditing {...props} />}
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
          {isProxyStage && <ManageVaultProxy {...props} />}
          {isCollateralAllowanceStage && <ManageVaultCollateralAllowanceStatus {...props} />}
          {isDaiAllowanceStage && <ManageVaultDaiAllowanceStatus {...props} />}
          {isManageStage && <ManageVaultConfirmationStatus {...props} />}
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
    <Grid mt={4} columns={['1fr', '2fr minmax(380px, 1fr)']} gap={5}>
      <ManageVaultHeading {...props} sx={{ display: ['block', 'none'] }} />
      <Box mb={6} sx={{ order: [3, 1] }}>
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
      customLoader={
        <Box
          sx={{
            position: 'relative',
            height: 600,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AppSpinner sx={{ mx: 'auto', display: 'block' }} variant="styles.spinner.extraLarge" />
        </Box>
      }
    >
      {(manageVault) => (
        <Grid sx={{ width: '100%', zIndex: 1, ...slideInAnimation, position: 'relative' }}>
          <ManageVaultContainer {...manageVault} />
        </Grid>
      )}
    </WithLoadingIndicator>
  )
}
