import { CommonVaultState } from 'helpers/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

import { TxStatusCardProgress, TxStatusCardSuccess } from './TxStatusCard'

export function VaultProxyStatusCard({
  stage,
  proxyConfirmations,
  safeConfirmations,
  proxyTxHash,
  etherscan,
}: CommonVaultState) {
  const { t } = useTranslation()
  return (
    <Grid>
      {stage === 'proxyInProgress' && (
        <TxStatusCardProgress
          etherscan={etherscan!}
          text={t('proxy-deployment-confirming', {
            proxyConfirmations: proxyConfirmations || 0,
            safeConfirmations,
          })}
          txHash={proxyTxHash!}
        />
      )}
      {stage === 'proxySuccess' && (
        <TxStatusCardSuccess
          text={t('proxy-deployment-confirming', {
            proxyConfirmations: safeConfirmations,
            safeConfirmations,
          })}
          etherscan={etherscan!}
          txHash={proxyTxHash!}
        />
      )}
    </Grid>
  )
}
