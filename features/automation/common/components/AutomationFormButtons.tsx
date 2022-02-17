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
      <Box>
        <RetryableLoadingButton {...triggerConfig} />
      </Box>
      <Divider variant="styles.hrVaultFormBottom" />
      <Flex sx={{ justifyContent: 'center' }}>
        <Button sx={{ mt: 3 }} variant="textualSmall" onClick={toggleForms}>
          {t(toggleKey)}
        </Button>
      </Flex>
    </>
  )
}
