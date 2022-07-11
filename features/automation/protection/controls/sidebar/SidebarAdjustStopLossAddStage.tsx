import { Box } from '@theme-ui/components'
import { AppLink } from 'components/Links'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Divider, Flex, Image, Text } from 'theme-ui'
import { AddingStopLossAnimation } from 'theme/animations'

import { AdjustSlFormLayoutProps, ProtectionCompleteInformation } from '../AdjustSlFormLayout'

export function SidebarAdjustStopLossAddStage(props: AdjustSlFormLayoutProps) {
  const { t } = useTranslation()
  const {
    stage,
    token,
    txState,
    selectedSLValue,
    tokenPrice,
    vault,
    ilkData,
    closePickerConfig,
    txCost,
  } = props

  switch (stage) {
    case 'txInProgress':
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('protection.setting-downside-protection-desc')}
          </Text>
          <AddingStopLossAnimation />
        </>
      )
    case 'txSuccess':
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('protection.downside-protection-complete-desc')}{' '}
            <AppLink href="https://kb.oasis.app/help/stop-loss-protection" sx={{ fontSize: 2 }}>
              {t('here')}.
            </AppLink>
          </Text>
          <Box>
            <Flex sx={{ justifyContent: 'center', mb: 4 }}>
              <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
            </Flex>
            <Divider variant="styles.hrVaultFormBottom" mb={4} />
            <ProtectionCompleteInformation
              token={token}
              txState={txState}
              afterStopLossRatio={selectedSLValue}
              tokenPrice={tokenPrice}
              vault={vault}
              ilkData={ilkData}
              isCollateralActive={closePickerConfig.isCollateralActive}
              txCost={txCost!}
            />
          </Box>
          <Box>
            <VaultChangesWithADelayCard />
          </Box>
        </>
      )
    default:
      return null
  }
}
