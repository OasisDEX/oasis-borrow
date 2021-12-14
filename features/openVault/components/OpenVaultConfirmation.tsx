import { TxStatusCardProgress, TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import { pick } from 'helpers/pick'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Divider } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

import { OpenVaultChangesInformation } from './OpenVaultChangesInformation'
import { OpenBorrowVaultContext } from './OpenVaultView'

export function OpenVaultConfirmation() {
  const { stage } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ...pick(ctx, 'stage'),
  }))
  return stage === 'txInProgress' ? (
    <OpenVaultAnimation />
  ) : (
    <>
      <Divider />
      <OpenVaultChangesInformation />
    </>
  )
}

export function OpenVaultStatus() {
  const { t } = useTranslation()
  const { stage, etherscan, id, openTxHash } = useSelectFromContext(
    OpenBorrowVaultContext,
    (ctx) => ({
      ...pick(ctx, 'stage', 'etherscan', 'id', 'openTxHash'),
    }),
  )

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
