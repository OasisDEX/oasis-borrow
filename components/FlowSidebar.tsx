import { useActor } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import { AllowanceView } from 'features/stateMachines/allowance'
import { CreateDPMAccountViewConsumed } from 'features/stateMachines/dpmAccount/CreateDPMAccountView'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { allDefined } from 'helpers/allDefined'
import { callBackIfDefined } from 'helpers/callBackIfDefined'
import type {
  useFlowState,
  UseFlowStateCBParamsType,
  UseFlowStateCBType,
} from 'helpers/useFlowState'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo } from 'react'
import { Card, Grid, Text } from 'theme-ui'

import type { SidebarSectionProps } from './sidebar/SidebarSection'
import { SidebarSection } from './sidebar/SidebarSection'
import type { SidebarSectionFooterButtonSettings } from './sidebar/SidebarSectionFooter'

export type CreateDPMAccountViewProps = {
  noConnectionContent?: JSX.Element
} & ReturnType<typeof useFlowState>

function useConnectWalletPrimaryButton(): SidebarSectionFooterButtonSettings {
  const { t } = useTranslation()
  const { connect, connecting } = useConnection()

  return useMemo(
    () => ({
      label: t('connect-wallet'),
      action: () => {
        if (!connecting) {
          connect()
        }
      },
      steps: undefined,
      isLoading: connecting,
      disabled: connecting,
    }),
    [t, connecting, connect],
  )
}

function NoConnectionStateView({
  noConnectionContent,
}: {
  noConnectionContent?: CreateDPMAccountViewProps['noConnectionContent']
}) {
  const { t } = useTranslation()
  const primaryButton = useConnectWalletPrimaryButton()
  const sidebarSectionProps: SidebarSectionProps = {
    title: t('dpm.create-flow.welcome-screen.header'),
    content: (
      <Grid gap={3}>
        {noConnectionContent || (
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vaults-overview.headers.not-connected-suggestions')}
          </Text>
        )}
      </Grid>
    ),
    primaryButton,
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function FlowSidebar({
  noConnectionContent,
  internals,
  isWalletConnected = false,
  token,
  amount,
  isProxyReady,
  isAllowanceReady,
  isLoading,
  walletAddress,
  availableProxies,
  asUserAction,
  onEverythingReady,
  isUiDataLoading,
}: CreateDPMAccountViewProps) {
  const [dpmState, dpmSend] = useActor(internals.dpmMachine)
  const [allowanceState] = useActor(internals.allowanceMachine)
  const allowanceConsidered = !!token && token !== 'ETH' && amount

  const callbackParams = {
    availableProxies,
    walletAddress,
    amount,
    token,
    isProxyReady,
    isWalletConnected,
    isAllowanceReady,
    asUserAction,
  }

  // a case when proxy is ready and amount/token is not provided (skipping allowance)
  useEffect(() => {
    if (!isProxyReady || !allDefined(walletAddress, amount, token)) return
    if (!token || !amount || new BigNumber(amount || NaN).isNaN()) {
      callBackIfDefined<UseFlowStateCBType, UseFlowStateCBParamsType>(
        callbackParams,
        onEverythingReady,
      )
    }
  }, [token, amount?.toString(), isProxyReady])

  // wrapping up
  useEffect(() => {
    if (isAllowanceReady && amount && token && availableProxies.length) {
      callBackIfDefined<UseFlowStateCBType, UseFlowStateCBParamsType>(
        callbackParams,
        onEverythingReady,
      )
    }
  }, [isAllowanceReady, availableProxies, amount?.toString()])

  if (!isWalletConnected) {
    return <NoConnectionStateView noConnectionContent={noConnectionContent} />
  }

  if (isUiDataLoading) {
    return (
      <Card
        sx={{
          position: 'relative',
          py: '28px',
          px: '24px',
          border: 'lightMuted',
          flex: 1,
        }}
      >
        <Skeleton sx={{ mb: 4 }} />
        <Skeleton height="200px" width="100%" sx={{ mb: 3 }} />
        <Skeleton height="150px" width="100%" sx={{ mb: 4 }} />
        <Skeleton height="53px" />
      </Card>
    )
  }

  if (!isProxyReady && !isAllowanceReady) {
    switch (true) {
      case dpmState.matches('idle'):
      case dpmState.matches('txFailure'):
      case dpmState.matches('txInProgressEthers'):
      case dpmState.matches('txSuccess'):
        return (
          <CreateDPMAccountViewConsumed
            state={dpmState}
            send={dpmSend}
            backButtonOnFirstStep="back-to-editing"
          />
        )
      default:
        return <></>
    }
  }
  if (isProxyReady && !isAllowanceReady && allowanceConsidered) {
    switch (true) {
      case allowanceState.matches('idle'):
      case allowanceState.matches('txFailure'):
      case allowanceState.matches('txInProgressEthers'):
      case allowanceState.matches('txSuccess'):
        return (
          <AllowanceView
            allowanceMachine={internals.allowanceMachine}
            isLoading={isLoading}
            backButtonOnFirstStep="back-to-editing"
          />
        )
      default:
        return <></>
    }
  }
  return <></>
}
