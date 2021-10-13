import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Divider } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

import { OpenVaultState } from '../openVault'
import { OpenVaultChangesInformation } from './OpenVaultChangesInformation'

export function OpenVaultConfirmation(props: OpenVaultState) {
  return props.stage === 'openInProgress' ? (
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
