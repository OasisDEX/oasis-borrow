import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box, Flex, Image, Text } from 'theme-ui'
import { AddingStopLossAnimation } from 'theme/animations'

interface SidebarAutoBuyCreationStageProps {
  stage: SidebarVaultStages
}

export function SidebarAutoBuyCreationStage({ stage }: SidebarAutoBuyCreationStageProps) {
  switch (stage) {
    case 'txInProgress':
      return (
        <>
          <AddingStopLossAnimation />
          <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae erat at tellus
            blandit fermentum. Sed hendrerit hendrerit mi quis porttitor.
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
          <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae erat at tellus
            blandit fermentum. Sed hendrerit hendrerit mi quis porttitor.
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
