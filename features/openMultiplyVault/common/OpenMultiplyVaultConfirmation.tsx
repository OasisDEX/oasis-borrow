import { Divider } from '@theme-ui/components'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { OpenVaultAnimation } from 'theme/animations'

import { OpenMultiplyVaultState } from '../openMultiplyVault'
import { DefaultOpenMultiplyVaultChangesInformation } from '../variants/default/open/DefaultOpenMultiplyVaultChangesInformation'

export function OpenMultiplyVaultConfirmation(props: OpenMultiplyVaultState) {
  return props.stage === 'txInProgress' ? (
    <OpenVaultAnimation />
  ) : (
    <>
      <Divider />
      <DefaultOpenMultiplyVaultChangesInformation {...props} />
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

  if (stage === 'txInProgress') {
    return (
      <TxStatusCardProgress
        text={t('creating-your-vault-multiply')}
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
