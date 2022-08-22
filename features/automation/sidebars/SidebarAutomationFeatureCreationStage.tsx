import { AppLink } from 'components/Links'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Image, Text } from 'theme-ui'
import { AddingStopLossAnimation } from 'theme/animations'

interface SidebarAutomationFeatureCreationStageProps {
  featureName: 'Auto-Buy' | 'Auto-Sell' | 'Constant Multiple'
  stage: SidebarVaultStages
  isAddForm: boolean
  isRemoveForm: boolean
}

export function SidebarAutomationFeatureCreationStage({
  featureName,
  stage,
  isAddForm,
  isRemoveForm,
}: SidebarAutomationFeatureCreationStageProps) {
  const { t } = useTranslation()

  const linkMap = {
    'Auto-Buy': 'setting-up-auto-buy-for-your-vault',
    'Auto-Sell': 'setting-up-auto-sell-for-your-vault',
    'Constant Multiple': 'what-is-constant-multiple',
  }

  switch (stage) {
    case 'txInProgress':
      return (
        <>
          <AddingStopLossAnimation />
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {isAddForm && t('automation-creation.add-content', { featureName })}
            {isRemoveForm && t('automation-creation.remove-content', { featureName })}
          </Text>
        </>
      )
    case 'txSuccess':
      return (
        <>
          <Box>
            <Flex sx={{ justifyContent: 'center', mb: 4 }}>
              <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
            </Flex>
          </Box>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {isAddForm && (
              <>
                {t('automation-creation.add-complete-content', { featureName })}{' '}
                <AppLink
                  href={`https://kb.oasis.app/help/${linkMap[featureName]}`}
                  sx={{ fontSize: 2 }}
                >
                  {t('here')}.
                </AppLink>
              </>
            )}
            {isRemoveForm && t('automation-creation.remove-complete-content', { featureName })}
          </Text>
          <Box>
            <VaultChangesWithADelayCard />
          </Box>
        </>
      )
    default:
      return null
  }
}
