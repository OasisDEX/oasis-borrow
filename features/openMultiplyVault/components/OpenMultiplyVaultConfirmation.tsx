import { Box } from '@theme-ui/components'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { OpenMultiplyVaultState } from '../openMultiplyVault'
import { OpenMultiplyVaultOrderInformation } from './OpenMultiplyVaultOrderInformation'
import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'

export function OpenMultiplyVaultConfirmation(props: OpenMultiplyVaultState) {
  return (
    <>
      <Box sx={{ borderBottom: 'light' }} />
      <OpenMultiplyVaultOrderInformation {...props} />
    </>
  )
}

export function OpenMultiplyVaultStatus({
  stage,
  id,
  etherscan,
  openTxHash,
}: OpenMultiplyVaultState) {
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
