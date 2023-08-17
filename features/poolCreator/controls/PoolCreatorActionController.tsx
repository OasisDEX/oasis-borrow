
import { useConnection } from 'features/web3OnBoard'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React, { FC } from 'react'
import { Button, Spinner } from 'theme-ui'

interface PoolCreatorActionControllerProps {
  isFormReady: boolean
  isLoading: boolean
  onSubmit: () => void
}

export const PoolCreatorActionController: FC<PoolCreatorActionControllerProps> = ({
  isFormReady,
  isLoading,
  onSubmit,
}) => {
  const { t } = useTranslation()

  const { connect } = useConnection()
  const { isConnected } = useAccount()
  const isDisabled = isConnected && !isFormReady

  return (
    <Button
      disabled={isDisabled}
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
      {isLoading && <Spinner size={24} color="neutral10" sx={{ mr: 2, mb: '2px' }} />}
      {isConnected ? t('pool-creator.form.submit') : t('connect-wallet')}
    </Button>
  )
}
