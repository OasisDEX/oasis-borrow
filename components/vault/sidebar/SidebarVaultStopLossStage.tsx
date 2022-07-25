import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { OpenMultiplyVaultStage } from 'features/multiply/open/pipes/openMultiplyVault'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Image, Text } from 'theme-ui'
import { AddingStopLossAnimation } from 'theme/animations'

export function SidebarVaultStopLossStage(props: {
  stage: OpenVaultStage | OpenMultiplyVaultStage
}) {
  const { t } = useTranslation()
  const { stage } = props

  switch (stage) {
    case 'stopLossTxInProgress':
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('open-vault-two-tx-setup-requirement')}
          </Text>
          <AddingStopLossAnimation />
        </>
      )
    default:
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('open-vault-two-tx-setup-requirement')}
          </Text>
          <Flex sx={{ justifyContent: 'center' }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </>
      )
  }
}
