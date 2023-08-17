import {
  SidebarSectionStatus,
  SidebarSectionStatusProps,
} from 'components/sidebar/SidebarSectionStatus'
import { TxStatuses } from 'features/ajna/positions/common/contexts/ajnaTxManager'
import { useConnection } from 'features/web3OnBoard'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React, { FC } from 'react'
import { Button, Grid, Spinner } from 'theme-ui'

interface PoolCreatorActionControllerProps {
  isFormValid: boolean
  isLoading: boolean
  txSidebarStatus?: SidebarSectionStatusProps
  txStatuses: TxStatuses
  onSubmit: () => void
}

export const PoolCreatorActionController: FC<PoolCreatorActionControllerProps> = ({
  isFormValid,
  isLoading,
  txSidebarStatus,
  txStatuses: { isTxError, isTxInProgress, isTxWaitingForApproval },
  onSubmit,
}) => {
  const { t } = useTranslation()

  const { connect } = useConnection()
  const { isConnected } = useAccount()

  const isPrimaryButtonDisabled =
    isConnected && (!isFormValid || isTxInProgress || isTxWaitingForApproval)
  const isPrimaryButtonLoading =
    isLoading || (isConnected && (isTxInProgress || isTxWaitingForApproval))
  const primaryButtonLabel = !isConnected
    ? t('connect-wallet')
    : isTxError
    ? t('retry')
    : t('pool-creator.form.submit')

  return (
    <Grid gap={3}>
      <Button
        disabled={isPrimaryButtonDisabled}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
        onClick={() => {
          if (isConnected) onSubmit()
          else void connect()
        }}
      >
        {isPrimaryButtonLoading && (
          <Spinner size={24} color="neutral10" sx={{ mr: 2, mb: '2px' }} />
        )}
        {primaryButtonLabel}
      </Button>
      {txSidebarStatus && <SidebarSectionStatus {...txSidebarStatus} />}
    </Grid>
  )
}
