import { AppLink } from 'components/Links'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import {
  sidebarAutomationFeatureCopyMap,
  sidebarAutomationLinkMap,
} from 'features/automation/common/consts'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Image, Text } from 'theme-ui'

import type { SidebarAutomationFeatureCreationStageProps } from './SidebarAutomationFeatureCreationStage.types'

export function SidebarAutomationFeatureCreationStage({
  featureName,
  stage,
  isAddForm,
  isRemoveForm,
  customContent,
}: SidebarAutomationFeatureCreationStageProps) {
  const { t } = useTranslation()

  switch (stage) {
    case 'txInProgress':
      return (
        <>
          <AddingStopLossAnimation />
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {isAddForm &&
              t('automation-creation.add-content', {
                featureName: t(sidebarAutomationFeatureCopyMap[featureName]),
              })}
            {isRemoveForm &&
              t('automation-creation.remove-content', {
                featureName: t(sidebarAutomationFeatureCopyMap[featureName]),
              })}
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
                {t('automation-creation.add-complete-content', {
                  featureName: t(sidebarAutomationFeatureCopyMap[featureName]),
                })}{' '}
                <AppLink
                  href={`https://docs.summer.fi/products/${sidebarAutomationLinkMap[featureName]}`}
                  sx={{ fontSize: 2 }}
                >
                  {t('here')}.
                </AppLink>
              </>
            )}
            {isRemoveForm &&
              t('automation-creation.remove-complete-content', {
                featureName: t(sidebarAutomationFeatureCopyMap[featureName]),
              })}
          </Text>
          {isAddForm && !!customContent && <Box mt={3}>{!!customContent && customContent}</Box>}
          <Box>
            <VaultChangesWithADelayCard />
          </Box>
        </>
      )
    default:
      return null
  }
}
