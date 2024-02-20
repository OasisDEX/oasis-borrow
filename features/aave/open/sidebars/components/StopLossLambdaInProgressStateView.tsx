import { executeTransaction } from 'blockchain/better-calls/dpm-account'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  ConnectedSidebarSection,
  OpenAaveStopLossInformation,
  StopLossTwoTxRequirement,
} from 'features/aave/components'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { AddingStopLossAnimation } from 'theme/animations'
import { Grid } from 'theme-ui'

export function StopLossLambdaInProgressStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { signer } = useWalletManagement()
  const { stopLossTxDataLambda } = state.context

  useEffect(() => {
    const executeCall = async () => {
      const { strategyConfig } = state.context
      if (stopLossTxDataLambda && signer) {
        return await executeTransaction({
          data: stopLossTxDataLambda.data,
          to: stopLossTxDataLambda.to,
          signer: signer,
          networkId: strategyConfig.networkId,
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
