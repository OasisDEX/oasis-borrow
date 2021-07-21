import { TxStatusCardSuccess } from 'components/vault/TxStatusCard'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Lottie from 'react-lottie'
import { Box, Divider } from 'theme-ui'
import animationData from 'theme/lottie/openVault.json'

import { OpenVaultState } from '../openVault'
import { OpenVaultChangesInformation } from './OpenVaultChangesInformation'

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

export function OpenVaultConfirmation(props: OpenVaultState) {
  return props.stage === 'openInProgress' ? (
    <Box mb={2}>
      <Lottie options={defaultOptions} height={160} width={160} />
    </Box>
  ) : (
    <>
      <Divider />
      <OpenVaultChangesInformation {...props} />
    </>
  )
}

export function OpenVaultStatus({ stage, id, etherscan, openTxHash }: OpenVaultState) {
  const { t } = useTranslation()

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
