import { Text } from '@theme-ui/components'
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Divider } from 'theme-ui'

interface FormHeaderProps {
  header: ReactNode
  description: ReactNode
  withDivider?: boolean
}

export function FormHeader({ header, description, withDivider = false }: FormHeaderProps) {
  return (
    <Box>
      <Text variant="boldParagraph2" mb={2}>
        {header}
      </Text>
      <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
        {description}
      </Text>
      {withDivider && <Divider variant="styles.hrVaultFormBottom" mb={4} mt="24px" />}
    </Box>
  )
}
