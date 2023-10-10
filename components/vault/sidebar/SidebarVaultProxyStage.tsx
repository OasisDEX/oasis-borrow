import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import type { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Image, Text } from 'theme-ui'

interface SidebarOpenVaultProxyStageProps {
  stage: SidebarVaultStages
  gasData: HasGasEstimation
}

export function SidebarVaultProxyStage({ stage, gasData }: SidebarOpenVaultProxyStageProps) {
  const { t } = useTranslation()
  const { ProxyCreationDisabled: isProxyCreationDisabled } = useAppConfig('features')

  const isProxyInfoStage = [
    'proxyWaitingForConfirmation',
    'proxyWaitingForApproval',
    'proxyFailure',
  ].includes(stage)

  if (!isProxyCreationDisabled) {
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
              1: <AppLink href={EXTERNAL_LINKS.KB.WHAT_IS_PROXY} sx={{ fontSize: 2 }} />,
            }}
          />
        </Text>
        {isProxyInfoStage ? (
          <>
            <ListWithIcon
              icon="checkmark"
              iconSize="14px"
              iconColor="primary100"
              items={t('proxy-advantages', { returnObjects: true })}
              listStyle={{ my: 2 }}
            />
            <VaultChangesInformationContainer title={t('creating-proxy-contract')}>
              <VaultChangesInformationItem
                label={t('transaction-fee')}
                value={getEstimatedGasFeeTextOld(gasData)}
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
  } else {
    return (
      <>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          <Trans
            i18nKey="vault-form.subtext.new-proxy-temporally-disabled"
            components={{
              1: <AppLink href={EXTERNAL_LINKS.BLOG.VAULT_AFTER_MERGE} sx={{ fontSize: 2 }} />,
            }}
          />
        </Text>
      </>
    )
  }
}
