import React, { ReactNode } from 'react'
import { Box, Text } from 'theme-ui'

interface AjnaHeaderProps {
  intro?: ReactNode
  title: ReactNode
}

export function AjnaHeader({ intro, title }: AjnaHeaderProps) {
  return (
    <Box
      sx={{
        my: [3, null, '48px'],
        textAlign: 'center',
      }}
    >
      <Text as="h1" variant="header2">
        {title}
      </Text>
      {intro && (
        <Text
          as="p"
          variant="paragraph2"
          sx={{
            maxWidth: '740px',
            mx: 'auto',
            mt: 3,
            color: 'neutral80',
          }}
        >
          {intro}
        </Text>
      )}
    </Box>
  )
}
