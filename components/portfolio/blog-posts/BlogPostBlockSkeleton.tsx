import { BlogPostDot } from 'components/portfolio/blog-posts/BlogPostDot'
import { Skeleton } from 'components/Skeleton'
import React from 'react'
import { Flex } from 'theme-ui'

export const BlogPostBlockSkeleton = () => {
  return (
    <Flex
      sx={{
        flexDirection: 'row',
        mb: 2,
        p: 2,
        py: 3,
      }}
    >
      <BlogPostDot
        read={true}
        sx={{
          m: 3,
          ml: 2,
        }}
      />
      <Flex sx={{ flexDirection: 'column' }}>
        <Skeleton height={20} width={330} sx={{ mb: 2 }} />
        <Skeleton height={13} width={170} />
      </Flex>
    </Flex>
  )
}
