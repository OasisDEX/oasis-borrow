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
        <Skeleton width={Math.random() * 150 + 100} sx={{ mb: 2 }} />
        <Skeleton width={Math.random() * 100 + 80} />
      </Flex>
    </Flex>
  )
}
