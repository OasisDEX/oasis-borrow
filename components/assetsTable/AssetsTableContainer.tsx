import React, { PropsWithChildren } from 'react'
import { Box, Heading } from 'theme-ui'

interface AssetsTableContainerProps {
  padded?: boolean
  tableOnly?: boolean
  title?: string
}

export function AssetsTableContainer({
  children,
  padded = false,
  tableOnly,
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
        ...(tableOnly && { overflow: 'hidden' }),
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
