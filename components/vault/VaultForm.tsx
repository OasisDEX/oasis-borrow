import { Box, Flex, Text } from '@theme-ui/components'
import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'

export function WithVaultFormStepIndicator({
  currentStep,
  totalSteps,
  children,
}: {
  currentStep: number
  totalSteps: number
} & WithChildren) {
  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Box
        sx={{
          color: 'neutral80',
          fontSize: 1,
          fontWeight: 'semiBold',
          border: 'lightMuted',
          borderRadius: 'large',
          px: 3,
        }}
      >
        <Box sx={{ position: 'relative', top: '1px' }}>
          <Text as="span" sx={{ color: 'primary100', fontSize: 3 }}>
            {currentStep}
          </Text>{' '}
          / {totalSteps}
        </Box>
      </Box>
    </Flex>
  )
}
