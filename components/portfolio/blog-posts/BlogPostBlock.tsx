import { AppLink } from 'components/Links'
import { BlogPostDot } from 'components/portfolio/blog-posts/BlogPostDot'
import dayjs from 'dayjs'
import type { BlogPostsReply } from 'helpers/types/blog-posts.types'
import React from 'react'
import { Flex, Text } from 'theme-ui'

export const BlogPostBlock = ({
  post,
  readPostsList = [],
  onClick,
}: {
  post: BlogPostsReply[number]
  readPostsList: string[]
  onClick?: (postid: string) => void
}) => {
  return (
    <AppLink href={post.url} onClick={onClick ? () => onClick(post.id) : undefined}>
      <Flex
        sx={{
          flexDirection: 'row',
          mb: 2,
          borderRadius: 'large',
          p: 2,
          py: 3,
          transition: 'background-color 200ms',
          '&:hover': {
            backgroundColor: 'neutral30',
          },
        }}
      >
        <BlogPostDot
          read={readPostsList.includes(post.id)}
          sx={{
            m: 3,
            ml: 2,
          }}
        />
        <Flex sx={{ flexDirection: 'column' }}>
          <Text variant="boldParagraph3">{post.title}</Text>
          <Text variant="paragraph4" color="neutral80">
            {dayjs(post.date).format('MMMM DD, YYYY')}
          </Text>
        </Flex>
      </Flex>
    </AppLink>
  )
}
