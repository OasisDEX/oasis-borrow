import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { HasGasEstimation } from 'helpers/form'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Image, Text } from 'theme-ui'

import {
  getEstimatedGasFeeText,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../VaultChangesInformation'

interface SidebarOpenVaultProxyStageProps {
  stage: SidebarVaultStages
  gasData: HasGasEstimation
}

export function SidebarVaultProxyStage({ stage, gasData }: SidebarOpenVaultProxyStageProps) {
  const { t } = useTranslation()

  const isProxyInfoStage = [
    'proxyWaitingForConfirmation',
    'proxyWaitingForApproval',
    'proxyFailure',
  ].includes(stage)

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
              value={getEstimatedGasFeeText(gasData)}
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
