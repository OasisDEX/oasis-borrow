import { Box, Button } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Divider, Flex } from 'theme-ui'

import {
  RetryableLoadingButton,
  RetryableLoadingButtonProps,
} from '../../../../components/dumb/RetryableLoadingButton'

interface AutomationFormButtonsProps {
  triggerConfig: RetryableLoadingButtonProps
  toggleForms: () => void
  toggleKey: string
}

export function AutomationFormButtons({
  triggerConfig,
  toggleForms,
  toggleKey,
}: AutomationFormButtonsProps) {
  const { t } = useTranslation()

  return (
    <>
      {(triggerConfig.isEditing || triggerConfig.isStopLossEnabled) && (
        <Box>
          <RetryableLoadingButton {...triggerConfig} />
        </Box>
      )}
      {!triggerConfig.isEditing && !triggerConfig.isStopLossEnabled && (
        <Box>
          <Button
            sx={{ width: '100%', justifySelf: 'center' }}
            variant="primary"
            onClick={triggerConfig.onConfirm}
          >
            {t('Confirm')}
          </Button>
        </Box>
      )}
      {triggerConfig.isStopLossEnabled && (
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
