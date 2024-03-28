import { NetworkHexIds, NetworkIds, networksById } from 'blockchain/networks'
import { AppLink } from 'components/Links'
import type { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import { SidebarSectionStatus } from 'components/sidebar/SidebarSectionStatus'
import type { TxStatuses } from 'features/omni-kit/contexts'
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
  isOnSupportedNetwork: boolean
  networkId?: NetworkIds
  onSubmit: () => void
  quoteAddress: string
  txSidebarStatus?: SidebarSectionStatusProps
  txStatuses: TxStatuses
}

export const PoolCreatorActionController: FC<PoolCreatorActionControllerProps> = ({
  collateralAddress,
  isFormValid,
  isLoading,
  isOnSupportedNetwork,
  networkId = NetworkIds.MAINNET,
  onSubmit,
  quoteAddress,
  txSidebarStatus,
  txStatuses: { isTxError, isTxInProgress, isTxSuccess, isTxWaitingForApproval },
}) => {
  const { t } = useTranslation()

  const { connect, setChain } = useConnection()
  const { isConnected } = useAccount()

  const isPrimaryButtonDisabled =
    isConnected &&
    isOnSupportedNetwork &&
    (!isFormValid || isTxInProgress || isTxWaitingForApproval)
  const isPrimaryButtonLoading =
    isLoading || (isConnected && (isTxInProgress || isTxWaitingForApproval))
  const primaryButtonLabel = !isConnected
    ? t('connect-wallet')
    : !isOnSupportedNetwork
    ? t('switch-network')
    : isTxError
    ? t('retry')
    : t('pool-creator.form.submit')

  const networkName = networksById[networkId].name

  return (
    <Grid gap={3}>
      {isTxSuccess ? (
        <Flex sx={{ columnGap: 3 }}>
          <AppLink
            href={`/${networkName}/ajna/earn/${collateralAddress}-${quoteAddress}`}
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
            href={`/${networkName}/ajna/borrow/${collateralAddress}-${quoteAddress}`}
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
            if (isConnected && isOnSupportedNetwork) onSubmit()
            else if (!isOnSupportedNetwork) setChain(NetworkHexIds.MAINNET)
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
