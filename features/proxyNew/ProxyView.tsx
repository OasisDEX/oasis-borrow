import { useMachine } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Image, Text } from 'theme-ui'

import { GasEstimationContext } from '../../components/GasEstimationContextProvider'
import {
  getEstimatedGasFeeText,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../components/vault/VaultChangesInformation'
import { GasEstimationStatus, HasGasEstimation } from '../../helpers/form'
import { zero } from '../../helpers/zero'
import { ProxyStateMachine } from './state'

interface ProxyViewProps {
  proxyMachine: ProxyStateMachine
}

export function ProxyView({ proxyMachine }: ProxyViewProps) {
  const { t } = useTranslation()

  const [state] = useMachine(proxyMachine)

  const isProxyInfoStage = [
    'proxyIdle',
    'proxyWaitingForConfirmation',
    'proxyWaitingForApproval',
    'proxyFailure',
  ].includes(state.value as string)

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        <Trans
          i18nKey={
            isProxyInfoStage
              ? 'vault-form.subtext.proxy-start'
              : 'vault-form.subtext.proxy-progress'
          }
          components={{
            1: (
              <AppLink
                href="https://kb.oasis.app/help/what-is-a-proxy-contract"
                sx={{ fontSize: 2 }}
              />
            ),
          }}
        />
      </Text>
      {isProxyInfoStage ? (
        <>
          <ListWithIcon
            icon="checkmark"
            iconSize="14px"
            iconColor="primary100"
            items={t<string, string[]>('proxy-advantages-new', { returnObjects: true })}
            listStyle={{ my: 2 }}
          />
          <VaultChangesInformationContainer title={t('creating-proxy-contract')}>
            <VaultChangesInformationItem
              label={t('transaction-fee')}
              value={getEstimatedGasFeeText(GetContext(state.context.gasData))}
            />
          </VaultChangesInformationContainer>
        </>
      ) : (
        <Image
          src={staticFilesRuntimeUrl('/static/img/proxy_complete.gif')}
          sx={{ display: 'block', maxWidth: '210px', mx: 'auto' }}
        />
      )}
    </>
  )
}

function GetContext(estimate?: HasGasEstimation): GasEstimationContext {
  return {
    gasAmount: estimate ? new BigNumber(estimate.gasEstimation!) : zero,
    isSuccessful: !!estimate && estimate.gasEstimationStatus === GasEstimationStatus.calculated,
    usdValue: estimate ? estimate.gasEstimationUsd! : zero,
    isCompleted:
      !!estimate &&
      (estimate.gasEstimationStatus === GasEstimationStatus.error ||
        estimate.gasEstimationStatus === GasEstimationStatus.calculated),
  }
}
