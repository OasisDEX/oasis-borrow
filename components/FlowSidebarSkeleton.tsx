import { Skeleton } from 'components/Skeleton'
import type { FC } from 'react'
import React from 'react'
import { Card, Flex, Heading, Text } from 'theme-ui'

interface FlowSidebarSkeletonProps {
  step?: string
  title?: string
}

export const FlowSidebarSkeleton: FC<FlowSidebarSkeletonProps> = ({ step, title }) => {
  return (
    <Card
      sx={{
        position: 'relative',
        py: '25px',
        px: '24px',
        border: 'lightMuted',
        flex: 1,
        height: 'fit-content',
      }}
    >
      <Flex
        sx={{
          color: 'neutral80',
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          justifyContent: 'space-between',
        }}
      >
        {title ? (
          <Heading
            as="p"
            variant="boldParagraph2"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {title}
          </Heading>
        ) : (
          <Skeleton />
        )}
        {step && (
          <Text variant="boldParagraph3" sx={{ color: 'neutral80', ml: 3 }}>
            {step}
          </Text>
        )}
      </Flex>
      <Skeleton height="200px" width="100%" sx={{ mb: 3 }} />
      <Skeleton height="150px" width="100%" sx={{ mb: 4 }} />
      <Skeleton height="53px" />
    </Card>
  )
}
