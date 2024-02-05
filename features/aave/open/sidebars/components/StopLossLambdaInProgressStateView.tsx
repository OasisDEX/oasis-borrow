import { validateParameters } from 'blockchain/better-calls/dpm-account'
import { ensureContractsExist, getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  ConnectedSidebarSection,
  OpenAaveStopLossInformation,
  StopLossTwoTxRequirement,
} from 'features/aave/components'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { AddingStopLossAnimation } from 'theme/animations'
import { Grid } from 'theme-ui'

export function StopLossLambdaInProgressStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { stopLossTxDataLambda, strategyConfig, web3Context } = state.context

  useEffect(() => {
    const executeCall = async () => {
      if (stopLossTxDataLambda) {
        const proxyAddress = stopLossTxDataLambda.to
        const networkId = strategyConfig.networkId
        const contracts = getNetworkContracts(networkId, web3Context?.chainId)
        ensureContractsExist(networkId, contracts, ['automationBotV2'])
        const signer = (web3Context as ContextConnected)?.transactionProvider
        const { dpm } = await validateParameters({
          signer,
          networkId: networkId,
          proxyAddress,
        })
        return dpm.execute(contracts.automationBotV2.address, stopLossTxDataLambda.triggerTxData, {
          value: zero.toString(),
        })
      }
      return null
    }
    void executeCall()
      .then((tx) => {
        if (tx?.hash) {
          send({
            type: 'TRANSACTION_COMPLETED',
          })
        }
      })
      .catch((error) => {
        send({
          type: 'TRANSACTION_FAILED',
          error,
        })
      })
  }, [stopLossTxDataLambda])

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-vault-two-tx-second-step-title'),
    content: (
      <Grid gap={3}>
        <StopLossTwoTxRequirement typeKey="position" />
        <AddingStopLossAnimation />
        <OpenAaveStopLossInformation
          {...state.context}
          stopLossLevel={state.context.stopLossLevel!}
          collateralActive={!!state.context.collateralActive}
        />
      </Grid>
    ),
    primaryButton: {
      isLoading: true,
      disabled: true,
      label: t('set-up-stop-loss-tx'),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
