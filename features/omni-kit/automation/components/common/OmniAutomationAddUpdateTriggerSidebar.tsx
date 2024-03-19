import { AppLink } from 'components/Links'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import {
  sidebarAutomationFeatureCopyMap,
  sidebarAutomationLinkMap,
} from 'features/automation/common/consts'
import { AutomationFeatures } from 'features/automation/common/types'
import { OmniAutomationCancelNotice } from 'features/omni-kit/automation/components/common/OmniAutomationCancelNotice'
import { OmniAutomationFromOrder } from 'features/omni-kit/automation/components/common/OmniAutomationFromOrder'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'

export const OmniAutomationAddUpdateTriggerSidebar: FC = ({ children }) => {
  const { t } = useTranslation()
  const {
    environment: { productType },
    tx: { isTxSuccess, isTxInProgress },
  } = useOmniGeneralContext()
  const {
    automation: { commonForm },
  } = useOmniProductContext(productType)

  const [hash] = useHash()

  const activeUiDropdown =
    hash === 'protection'
      ? commonForm.state.uiDropdownProtection
      : commonForm.state.uiDropdownOptimization

  const resolvedActiveUiDropdown = commonForm.state.activeTxUiDropdown || activeUiDropdown

  if (!resolvedActiveUiDropdown) {
    return null
  }

  const notice = {
    [AutomationFeatures.STOP_LOSS]: (
      <OmniAutomationCancelNotice
        content={t('protection.cancel-notice', { ratioParam: t('system.loan-to-value') })}
      />
    ),
    [AutomationFeatures.TRAILING_STOP_LOSS]: (
      <OmniAutomationCancelNotice
        content={t('protection.cancel-notice', { ratioParam: t('system.loan-to-value') })}
      />
    ),
    [AutomationFeatures.AUTO_SELL]: null,
    [AutomationFeatures.AUTO_BUY]: null,
    [AutomationFeatures.PARTIAL_TAKE_PROFIT]: (
      <OmniAutomationCancelNotice content={t('protection.take-profit-cancel-notice')} />
    ),
    [AutomationFeatures.CONSTANT_MULTIPLE]: null,
    [AutomationFeatures.AUTO_TAKE_PROFIT]: null,
  }[resolvedActiveUiDropdown]

  if (isTxInProgress) {
    return (
      <>
        <AddingStopLossAnimation />
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('automation-creation.add-content', {
            featureName: t(sidebarAutomationFeatureCopyMap[resolvedActiveUiDropdown]),
          })}
        </Text>
      </>
    )
  }

  if (isTxSuccess) {
    return (
      <>
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </Box>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('automation-creation.add-complete-content', {
            featureName: t(sidebarAutomationFeatureCopyMap[resolvedActiveUiDropdown]),
          })}{' '}
          <AppLink
            href={`https://docs.summer.fi/products/${sidebarAutomationLinkMap[resolvedActiveUiDropdown]}`}
            sx={{ fontSize: 2 }}
          >
            {t('here')}.
          </AppLink>
        </Text>
        <Box mt={3}>
          <OmniAutomationFromOrder
            showReset={false}
            showDisclaimer={false}
            showValidation={false}
          />
        </Box>
        <Box>
          <VaultChangesWithADelayCard />
        </Box>
      </>
    )
  }

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.add-update-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[resolvedActiveUiDropdown]),
        })}
      </Text>
      {children}
      <OmniAutomationFromOrder showReset={false} showDisclaimer={false} showValidation={false} />
      {notice}
    </Grid>
  )
}
