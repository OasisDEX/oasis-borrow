import type { ReactNode } from 'react'
import React from 'react'
import { Box, Heading, Text } from 'theme-ui'

interface AjnaHeaderProps {
  intro?: ReactNode
  title: ReactNode
}

export function AjnaHeader({ intro, title }: AjnaHeaderProps) {
  return (
    <Box
      sx={{
        maxWidth: '740px',
        mx: 'auto',
        my: [3, null, '48px'],
        textAlign: 'center',
      }}
    >
      <Heading as="h1" variant="header2">
        {title}
      </Heading>
      {intro && (
        <Text
          as="p"
          variant="paragraph2"
          sx={{
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
