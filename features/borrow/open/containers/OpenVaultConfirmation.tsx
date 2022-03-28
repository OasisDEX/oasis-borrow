import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Divider } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

import { OpenVaultState } from '../pipes/openVault'
import { OpenVaultChangesInformation } from './OpenVaultChangesInformation'

export function OpenVaultConfirmation(props: OpenVaultState) {
  return props.stage === 'txInProgress' ? (
    <OpenVaultAnimation />
  ) : (
    <>
      <Divider />
      <OpenVaultChangesInformation {...props} />
    </>
  )
}

export function OpenVaultStatus({ stage, id, etherscan, openTxHash }: OpenVaultState) {
  const { t } = useTranslation()

  if (stage === 'txInProgress') {
    return (
      <TxStatusCardProgress
        text={t('creating-your-vault')}
        etherscan={etherscan!}
        txHash={openTxHash!}
      />
    )
  }

  if (stage === 'txSuccess') {
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
