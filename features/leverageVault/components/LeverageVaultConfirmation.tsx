import { Box } from '@theme-ui/components'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { LeverageVaultState } from '../leverageVault'
import { LeverageVaultOrderInformation } from './LeverageVaultOrderInformation'
import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'

export function LeverageVaultConfirmation(props: LeverageVaultState) {
  return (
    <>
      <Box sx={{ borderBottom: 'light' }} />
      <LeverageVaultOrderInformation {...props} />
    </>
  )
}

export function LeverageVaultStatus({ stage, id, etherscan, openTxHash }: LeverageVaultState) {
  const { t } = useTranslation()
  if (stage === 'openInProgress') {
    return (
      <TxStatusCardProgress
        text={t('creating-your-vault')}
        etherscan={etherscan!}
        txHash={openTxHash!}
      />
    )
  }
  if (stage === 'openSuccess') {
    return (
      <TxStatusCardSuccess
        text={t('vault-created', { id: id?.toString() })}
        etherscan={etherscan!}
        txHash={openTxHash!}
      />
    )
  }
  return null
}
