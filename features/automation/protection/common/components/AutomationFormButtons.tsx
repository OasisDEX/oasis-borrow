import { Box, Button } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Divider, Flex } from 'theme-ui'

import { useAppContext } from '../../../../../components/AppContextProvider'
import {
  RetryableLoadingButton,
  RetryableLoadingButtonProps,
} from '../../../../../components/dumb/RetryableLoadingButton'
import { VaultViewMode } from '../../../../../components/VaultTabSwitch'
import {
  AutomationFromKind,
  PROTECTION_MODE_CHANGE_SUBJECT,
} from '../UITypes/ProtectionFormModeChange'
import { TAB_CHANGE_SUBJECT } from '../UITypes/TabChange'

interface AutomationFormButtonsProps {
  triggerConfig: RetryableLoadingButtonProps
  toggleForms: () => void
  toggleKey: string
  txSuccess: boolean
  type?: 'adjust' | 'cancel'
}

export function AutomationFormButtons({
  triggerConfig,
  toggleForms,
  toggleKey,
  txSuccess,
  type,
}: AutomationFormButtonsProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  function backToVaultOverview() {
    uiChanges.publish(TAB_CHANGE_SUBJECT, {
      type: 'change-tab',
      currentMode: VaultViewMode.Overview,
    })
    uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
      currentMode: AutomationFromKind.ADJUST,
      type: 'change-mode',
    })
  }

  return (
    <>
      {!txSuccess && type === 'cancel' && (
        <Box>
          <RetryableLoadingButton {...triggerConfig} />
        </Box>
      )}
      {txSuccess && (
        <Box>
          <Button
            sx={{ width: '100%', justifySelf: 'center' }}
            variant="primary"
            onClick={backToVaultOverview}
          >
            {t('back-to-vault-overview')}
          </Button>
        </Box>
      )}
      {(triggerConfig.isStopLossEnabled || (txSuccess && type === 'cancel')) && (
        <>
          <Divider variant="styles.hrVaultFormBottom" />
          <Flex sx={{ justifyContent: 'center' }}>
            <Button sx={{ mt: 3 }} variant="textualSmall" onClick={toggleForms}>
              {t(toggleKey)}
            </Button>
          </Flex>
        </>
      )}
    </>
  )
}
