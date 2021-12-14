import BigNumber from 'bignumber.js'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Divider } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

import { OpenVaultStage, OpenVaultState } from '../openVault'
import { OpenVaultChangesInformation } from './OpenVaultChangesInformation'

export function OpenVaultConfirmation({ stage }: { stage: OpenVaultStage }) {
  return stage === 'txInProgress' ? (
    <OpenVaultAnimation />
  ) : (
    <>
      <Divider />
      <OpenVaultChangesInformation />
    </>
  )
}

type OpenVaultStatusProps = {
  stage: OpenVaultState['stage']
  id?: BigNumber
  etherscan?: string
  openTxHash?: string
}

export function OpenVaultStatus({ stage, id, etherscan, openTxHash }: OpenVaultStatusProps) {
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
