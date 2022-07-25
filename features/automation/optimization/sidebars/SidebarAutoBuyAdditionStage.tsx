import { AppLink } from 'components/Links'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Image, Text } from 'theme-ui'
import { AddingStopLossAnimation } from 'theme/animations'

interface SidebarAutoBuyCreationStageProps {
  stage: SidebarVaultStages
  isAddForm: boolean
  isRemoveForm: boolean
}

export function SidebarAutoBuyCreationStage({
  stage,
  isAddForm,
  isRemoveForm,
}: SidebarAutoBuyCreationStageProps) {
  const { t } = useTranslation()

  switch (stage) {
    case 'txInProgress':
      return (
        <>
          <AddingStopLossAnimation />
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {isAddForm && t('auto-buy.add-content')}
            {isRemoveForm && t('auto-buy.remove-content')}
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
                {t('auto-buy.add-complete-content')}{' '}
                <AppLink href="https://kb.oasis.app/help" sx={{ fontSize: 2 }}>
                  {t('here')}.
                </AppLink>
              </>
            )}
            {isRemoveForm && t('auto-buy.remove-complete-content')}
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
