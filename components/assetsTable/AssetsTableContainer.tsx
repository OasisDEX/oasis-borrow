import type { PropsWithChildren } from 'react'
import React from 'react'
import { Box, Heading } from 'theme-ui'

interface AssetsTableContainerProps {
  padded?: boolean
  title?: string
}

export function AssetsTableContainer({
  children,
  padded = false,
  title,
}: PropsWithChildren<AssetsTableContainerProps>) {
  return (
    <Box
      sx={{
        backgroundColor: 'neutral10',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'neutral20',
        ...(padded && { p: 4 }),
      }}
    >
      {title && (
        <Heading
          as="h2"
          variant="boldParagraph1"
          sx={{ mb: 4, pt: 4, px: ['24px', null, null, 4] }}
        >
          {title}
        </Heading>
      )}
      {children}
    </Box>
  )
}
