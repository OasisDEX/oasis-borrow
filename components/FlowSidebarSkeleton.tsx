import { Skeleton } from 'components/Skeleton'
import React from 'react'
import { Card } from 'theme-ui'

export const FlowSidebarSkeleton = () => {
  return (
    <Card
      sx={{
        position: 'relative',
        py: '28px',
        px: '24px',
        border: 'lightMuted',
        flex: 1,
        height: 'fit-content',
      }}
    >
      <Skeleton sx={{ mb: 4 }} />
      <Skeleton height="200px" width="100%" sx={{ mb: 3 }} />
      <Skeleton height="150px" width="100%" sx={{ mb: 4 }} />
      <Skeleton height="53px" />
    </Card>
  )
}
