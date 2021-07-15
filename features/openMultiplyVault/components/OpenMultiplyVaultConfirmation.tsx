import { Divider } from '@theme-ui/components'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { OpenMultiplyVaultState } from '../openMultiplyVault'
import { OpenMultiplyVaultChangesInformation } from './OpenMultiplyVaultChangesInformation'

export function OpenMultiplyVaultConfirmation(props: OpenMultiplyVaultState) {
  return (
    <>
      <Divider />
      <OpenMultiplyVaultChangesInformation {...props} />
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
