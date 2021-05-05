import { TxStatusCardProgress, TxStatusCardSuccess } from 'features/openVault/TxStatusCard'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ManageVaultState } from './manageVault'

export function ManageVaultProxy({
  stage,
  proxyConfirmations,
  safeConfirmations,
  proxyTxHash,
  etherscan,
}: ManageVaultState) {
  const { t } = useTranslation()

  return (
    <Grid>
      {stage === 'proxyInProgress' && (
        <TxStatusCardProgress
          etherscan={etherscan!}
          text={`${t('one-of-some', { one: proxyConfirmations || 0, some: safeConfirmations })} ${t(
            'waiting-proxy-deployment',
          )}`}
          txHash={proxyTxHash!}
        />
      )}
      {stage === 'proxySuccess' && (
        <TxStatusCardSuccess
          etherscan={etherscan!}
          text={`${t('one-of-some', { one: safeConfirmations || 0, some: safeConfirmations })} ${t(
            'waiting-proxy-deployment',
          )}`}
          txHash={proxyTxHash!}
        />
      )}
    </Grid>
  )
}
