import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'
import { Heading } from 'theme-ui'

export function AssetsTableHeading({ children }: WithChildren) {
  return (
    <Heading
      as="h3"
      variant="boldParagraph3"
      sx={{
        position: 'relative',
        px: ['24px', null, null, 4],
        mt: '24px',
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
