import { MessageCard } from 'components/MessageCard'
import type { SidebarSectionStatusProps } from 'components/sidebar/SidebarSectionStatus'
import { SidebarSectionStatus } from 'components/sidebar/SidebarSectionStatus'
import { getIsAllowanceStage } from 'features/allowance/allowance'
import type { DsrDepositState } from 'features/dsr/helpers/dsrDeposit.types'
import { isProxyStage } from 'features/proxy/proxy'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Image } from 'theme-ui'
import { AddingStopLossAnimation } from 'theme/animations'

function getTxHash(state: DsrDepositState) {
  if (getIsAllowanceStage(state.stage)) {
    return state.allowanceTxHash
  }

  if (isProxyStage(state.stage)) {
    return state.proxyTxHash
  }

  if (state.operation === 'withdraw') {
    return state.withdrawTxHash
  }

  return state.depositTxHash
}

function getSiderbarSectionStatus(state: DsrDepositState) {
  const { t } = useTranslation()
  const etherscan = 'https://etherscan.io'

  const txHash = getTxHash(state)

  switch (state.stage) {
    case 'depositInProgress':
    case 'depositWaiting4Approval':
    case 'withdrawInProgress':
    case 'withdrawWaiting4Approval':
    case 'allowanceInProgress':
    case 'allowanceWaitingForApproval':
      return [
        {
          text: 'In progress',
          type: 'progress',
          txHash,
          etherscan,
        },
      ]
    case 'proxyInProgress':
      return [
        {
          text: t('proxy-deployment-confirming', {
            proxyConfirmations: state.proxyConfirmations || 0,
            safeConfirmations: 6,
          }),
          type: 'progress',
          txHash,
          etherscan,
        },
      ]
    case 'proxySuccess':
      return [
        {
          text: t('proxy-deployment-confirming', {
            proxyConfirmations: 6,
            safeConfirmations: 6,
          }),
          type: 'success',
          txHash,
          etherscan,
        },
      ]
    case 'allowanceSuccess':
      return [
        {
          text: t('setting-allowance-for', { token: 'DAI' }),
          type: 'success',
          txHash,
          etherscan,
        },
      ]
    case 'depositSuccess':
    case 'withdrawSuccess':
      return [
        {
          text: 'Success',
          type: 'success',
          txHash,
          etherscan,
        },
      ]
    default:
      return []
  }
}

export function DsrSidebarCreation({ state }: { state: DsrDepositState }) {
  const [status] = getSiderbarSectionStatus(state) as SidebarSectionStatusProps[]

  switch (state.stage) {
    case 'depositInProgress':
    case 'depositWaiting4Approval':
    case 'withdrawInProgress':
    case 'withdrawWaiting4Approval':
    case 'allowanceInProgress':
    case 'allowanceWaitingForApproval':
      return (
        <>
          <AddingStopLossAnimation />
          {status?.txHash && <SidebarSectionStatus {...status} />}
        </>
      )
    case 'proxyInProgress':
    case 'proxyWaitingForApproval':
      return status?.txHash ? <SidebarSectionStatus {...status} /> : null
    case 'depositSuccess':
    case 'withdrawSuccess':
    case 'allowanceSuccess':
      return (
        <>
          <Box>
            <Flex sx={{ justifyContent: 'center', mb: 4 }}>
              <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
            </Flex>
          </Box>
          <MessageCard
            {...{
              messages: [
                'Heads up! It can take up to 30 seconds for your Vault position to update.',
              ],
              type: 'warning',
              withBullet: false,
            }}
          />
          {status?.txHash && <SidebarSectionStatus {...status} />}
        </>
      )
    case 'proxySuccess':
      return status?.txHash ? <SidebarSectionStatus {...status} /> : null
    default:
      return null
  }
}
