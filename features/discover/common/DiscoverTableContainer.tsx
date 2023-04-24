import React, { PropsWithChildren } from 'react'
import { Box, Heading } from 'theme-ui'

export function DiscoverTableContainer({
  children,
  padded = false,
  tableOnly,
  title,
}: PropsWithChildren<{ padded?: boolean; tableOnly?: boolean; title?: string }>) {
  return (
    <Box
      sx={{
        backgroundColor: 'neutral10',
        borderRadius: 'large',
        boxShadow: 'buttonMenu',
        ...(padded && { p: 4 }),
        ...(tableOnly && {
          pt: '12px',
          overflow: 'hidden',
        }),
      }}
    >
      {title && (
        <Heading
          as="h3"
          variant="boldParagraph2"
          sx={{ mb: 3, pt: 4, px: ['24px', null, null, 4] }}
        >
          {title}
        </Heading>
      )}
      {children}
    </Box>
  )
}
