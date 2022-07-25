import { Box } from '@theme-ui/components'
import { AppLink } from 'components/Links'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import {
  CancelCompleteInformation,
  CancelSlFormLayoutProps,
} from 'features/automation/protection/controls/CancelSlFormLayout'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Divider, Flex, Image, Text } from 'theme-ui'
import { AddingStopLossAnimation } from 'theme/animations'

export function SidebarCancelStopLossCancelStage(props: CancelSlFormLayoutProps) {
  const { t } = useTranslation()
  const { stage, tokenPrice, liquidationPrice, actualCancelTxCost, selectedSLValue } = props
  const [persistedStopLossLevel] = useState(selectedSLValue)

  switch (stage) {
    case 'txInProgress':
      return (
        <>
          <Text variant="paragraph3" sx={{ mb: 2, color: 'neutral80' }}>
            {t('protection.cancelling-downside-protection-desc')}
          </Text>
          <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', color: 'neutral80' }}>
            {t('protection.position-again-at-risk')}
          </Text>
          <AddingStopLossAnimation />
        </>
      )
    case 'txSuccess':
      return (
        <>
          <Text variant="paragraph3" sx={{ mb: 2, color: 'neutral80' }}>
            {t('protection.cancel-protection-complete-desc')}
          </Text>
          <AppLink
            href="https://kb.oasis.app/help/stop-loss-protection"
            sx={{ fontWeight: 'body' }}
          >
            {t('protection.find-more-about-setting-stop-loss')}
          </AppLink>
          <Box>
            <Flex sx={{ justifyContent: 'center', mb: 4 }}>
              <Image src={staticFilesRuntimeUrl('/static/img/cancellation_complete.svg')} />
            </Flex>
            <Divider variant="styles.hrVaultFormBottom" mb={4} />
            <CancelCompleteInformation
              liquidationPrice={liquidationPrice}
              tokenPrice={tokenPrice}
              totalCost={actualCancelTxCost!}
              selectedSLValue={persistedStopLossLevel}
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
