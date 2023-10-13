import { AppLink } from 'components/Links'
import type { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import { SidebarSectionStatus } from 'components/sidebar/SidebarSectionStatus'
import type { TxStatuses } from 'features/ajna/positions/common/contexts/ajnaTxManager'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Button, Flex, Grid, Spinner } from 'theme-ui'

interface PoolCreatorActionControllerProps {
  collateralAddress: string
  isFormValid: boolean
  isLoading: boolean
  quoteAddress: string
  txSidebarStatus?: SidebarSectionStatusProps
  txStatuses: TxStatuses
  onSubmit: () => void
}

export const PoolCreatorActionController: FC<PoolCreatorActionControllerProps> = ({
  collateralAddress,
  isFormValid,
  isLoading,
  quoteAddress,
  txSidebarStatus,
  txStatuses: { isTxError, isTxInProgress, isTxSuccess, isTxWaitingForApproval },
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
      {isTxSuccess ? (
        <Flex sx={{ columnGap: 3 }}>
          <AppLink
            href={`/ethereum/ajna/earn/${collateralAddress}-${quoteAddress}`}
            sx={{ width: '100%' }}
          >
            <Button
              variant="action"
              sx={{
                width: '100%',
                height: '52px',
                fontSize: '18px',
                borderRadius: 'round',
              }}
            >
              {t('nav.earn')}
            </Button>
          </AppLink>
          <AppLink
            href={`/ethereum/ajna/borrow/${collateralAddress}-${quoteAddress}`}
            sx={{ width: '100%' }}
          >
            <Button sx={{ width: '100%', height: '52px' }}>{t('nav.borrow')}</Button>
          </AppLink>
        </Flex>
      ) : (
        <Button
          disabled={isPrimaryButtonDisabled}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '52px',
            width: '100%',
          }}
          onClick={() => {
            if (isConnected) onSubmit()
            else connect()
          }}
        >
          {isPrimaryButtonLoading && (
            <Spinner size={24} color="neutral10" sx={{ mr: 2, mb: '2px' }} />
          )}
          {primaryButtonLabel}
        </Button>
      )}
      {txSidebarStatus && <SidebarSectionStatus {...txSidebarStatus} />}
    </Grid>
  )
}
