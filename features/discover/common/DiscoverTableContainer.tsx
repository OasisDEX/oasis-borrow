import React, { PropsWithChildren } from 'react'
import { Box, Heading } from 'theme-ui'

export function DiscoverTableContainer({
  children,
  padded = false,
  title,
}: PropsWithChildren<{ padded?: boolean; title?: string }>) {
  return (
    <Box
      sx={{
        backgroundColor: 'neutral10',
        borderRadius: 'large',
        boxShadow: 'buttonMenu',
        ...(padded && { p: 4 }),
      }}
    >
      {title && (
        <Heading as="h3" variant="boldParagraph2" sx={{ pt: 4, px: ['24px', null, null, 4] }}>
          {title}
        </Heading>
      )}
      {children}
    </Box>
  )
}
