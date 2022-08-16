import { useMachine } from '@xstate/react'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { Sender } from 'xstate'

import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import {
  ManageAaveEvent,
  ManageAaveStateMachine,
  ManageAaveStateMachineState,
} from '../state/types'
import { extractSidebarTxData } from '../../../../../helpers/extractSidebarHelpers'
import { OpenVaultAnimation } from '../../../../../theme/animations'
import { staticFilesRuntimeUrl } from '../../../../../helpers/staticPaths'

export interface ManageAaveVaultProps {
  readonly aaveManageStateMachine: ManageAaveStateMachine
}

interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ManageAaveInformationContainer({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationContainer title="Order information">
      <VaultChangesInformationItem
        label={t('total-fees')}
        value={getEstimatedGasFeeTextOld(state.context.estimatedGasPrice)}
      />
    </VaultChangesInformationContainer>
  )
}
//
// function OpenAaveTransactionInProgressStateView({ state, send }: OpenAaveStateProps) {
//   const { t } = useTranslation()
//
//   const sidebarSectionProps: SidebarSectionProps = {
//     title: t('open-earn.aave.vault-form.title'),
//     content: (
//       <Grid gap={3}>
//         <OpenVaultAnimation />
//         <OpenAaveInformationContainer state={state} send={send} />
//       </Grid>
//     ),
//     primaryButton: {
//       steps: [1, state.context.totalSteps!],
//       isLoading: true,
//       disabled: true,
//       label: t('open-earn.aave.vault-form.confirm-btn'),
//     },
//   }
//
//   return <SidebarSection {...sidebarSectionProps} />
// }
//
function ManageAaveReviewingStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.title'),
    content: <Grid gap={3}>{/*<OpenAaveInformationContainer state={state} send={send} />*/}</Grid>,
    primaryButton: {
      isLoading: false,
      disabled: true,
      label: t('manage-earn.aave.vault-form.deposit'),
      action: () => null,
    },
    textButton: {
      label: t('manage-earn.aave.vault-form.close-vault'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
//
// function OpenAaveFailureStateView({ state, send }: OpenAaveStateProps) {
//   const { t } = useTranslation()
//
//   const sidebarSectionProps: SidebarSectionProps = {
//     title: t('open-earn.aave.vault-form.title'),
//     content: (
//       <Grid gap={3}>
//         <OpenAaveInformationContainer state={state} send={send} />
//       </Grid>
//     ),
//     primaryButton: {
//       steps: [1, state.context.totalSteps!],
//       isLoading: false,
//       disabled: false,
//       label: t('open-earn.aave.vault-form.retry-btn'),
//       action: () => send({ type: 'RETRY' }),
//     },
//   }
//
//   return <SidebarSection {...sidebarSectionProps} />
// }
//
//
// function OpenAaveSuccessStateView({ state, send }: OpenAaveStateProps) {
//   const { t } = useTranslation()
//
//   const sidebarSectionProps: SidebarSectionProps = {
//     title: t('open-earn.aave.vault-form.success-title'),
//     content: (
//       <Grid gap={3}>
//         <Box>
//           <Flex sx={{ justifyContent: 'center', mb: 4 }}>
//             <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
//           </Flex>
//         </Box>
//         <OpenAaveInformationContainer state={state} send={send} />
//       </Grid>
//     ),
//     primaryButton: {
//       label: t('open-earn.aave.vault-form.go-to-position'),
//       url: `/earn/${state.context.strategyName}/${state.context.proxyAddress}`,
//     },
//   }
//
//   return <SidebarSection {...sidebarSectionProps} />
// }

export function SidebarManageAaveVault({ aaveManageStateMachine }: ManageAaveVaultProps) {
  const [state, send] = useMachine(aaveManageStateMachine)

  switch (true) {
    case state.matches('reviewing'):
      return <ManageAaveReviewingStateView state={state} send={send} />
    // case state.matches('txInProgress'):
    //   return <OpenAaveTransactionInProgressStateView state={state} send={send} />
    // case state.matches('txFailure'):
    //   return <OpenAaveFailureStateView state={state} send={send} />
    // case state.matches('txSuccess'):
    //   return <OpenAaveSuccessStateView state={state} send={send} />
    default: {
      return <></>
    }
  }
}
