import React, { PropsWithChildren } from 'react'
import { Heading } from 'theme-ui'

export function DiscoverTableHeading({ children }: PropsWithChildren<{}>) {
  return (
    <Heading
      as="h3"
      variant="boldParagraph3"
      sx={{
        position: 'relative',
        px: ['24px', null, null, 4],
        mt: [3, null, null, 4],
        pb: 3,
        borderBottom: '1px solid',
        borderColor: 'neutral20',
        zIndex: 1,
      }}
    >
      {children}
    </Heading>
  )
}
