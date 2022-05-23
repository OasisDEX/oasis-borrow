import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/manageMultiplyVault'
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

interface SidebarOpenBorrowVaultProxyStageProps {
  stage: OpenVaultStage | ManageBorrowVaultStage | ManageMultiplyVaultStage
  gasData: HasGasEstimation
}

export function SidebarOpenBorrowVaultProxyStage({
  stage,
  gasData,
}: SidebarOpenBorrowVaultProxyStageProps) {
  const { t } = useTranslation()

  const isProxyInfoStage = [
    'proxyWaitingForConfirmation',
    'proxyWaitingForApproval',
    'proxyFailure',
  ].includes(stage)

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
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
            items={t<string, string[]>('proxy-advantages', { returnObjects: true })}
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
