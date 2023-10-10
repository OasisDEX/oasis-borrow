import { AppLink } from 'components/Links'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { AutomationFeatures } from 'features/automation/common/types'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Image, Text } from 'theme-ui'
import { AddingStopLossAnimation } from 'theme/animations'

import type { SidebarAutomationFeatureCreationStageProps } from './SidebarAutomationFeatureCreationStage.types'

export function SidebarAutomationFeatureCreationStage({
  featureName,
  stage,
  isAddForm,
  isRemoveForm,
  customContent,
}: SidebarAutomationFeatureCreationStageProps) {
  const { t } = useTranslation()

  const linkMap = {
    [AutomationFeatures.STOP_LOSS]: 'what-is-automated-stop-loss',
    [AutomationFeatures.AUTO_BUY]: 'setting-up-auto-buy-for-your-vault',
    [AutomationFeatures.AUTO_SELL]: 'setting-up-auto-sell-for-your-vault',
    [AutomationFeatures.CONSTANT_MULTIPLE]: 'what-is-constant-multiple',
    [AutomationFeatures.AUTO_TAKE_PROFIT]: 'what-is-take-profit',
  }

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
                  href={`https://docs.summer.fi/products/${linkMap[featureName]}`}
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
