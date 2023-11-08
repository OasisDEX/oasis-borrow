import { AppLink } from 'components/Links'
import { BlogPostBlock } from 'components/portfolio/blog-posts/BlogPostBlock'
import { BlogPostBlockSkeleton } from 'components/portfolio/blog-posts/BlogPostBlockSkeleton'
import { BlogPostDot } from 'components/portfolio/blog-posts/BlogPostDot'
import { WithArrow } from 'components/WithArrow'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { ParsedBlogPost } from 'helpers/types/blog-posts.types'
import { useLocalStorage } from 'helpers/useLocalStorage'
import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

export const BlogPosts = ({ posts }: { posts?: ParsedBlogPost[] }) => {
  const [readPostsList, setReadPostList] = useLocalStorage<string[]>('ob-read-post-list', [])
  const updateReadPostsList = (postId: string) => {
    setReadPostList((prev) => (prev?.length ? [...prev, postId] : [postId]))
  }
  const hasReadAllPosts = posts?.every((post) => readPostsList.includes(post.id)) ?? false
  return (
    <>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Flex sx={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="boldParagraph2">News & Updates</Text>
          <BlogPostDot read={hasReadAllPosts} sx={{ ml: 2 }} />
        </Flex>
        <AppLink href={EXTERNAL_LINKS.BLOG.MAIN}>
          <WithArrow sx={{ color: 'interactive100', mr: 3 }}>View All</WithArrow>
        </AppLink>
      </Flex>
      <Box sx={{ mt: 3 }}>
        {posts
          ? posts.map((post) => (
              <BlogPostBlock
                key={post.id}
                post={post}
                readPostsList={readPostsList}
                onClick={updateReadPostsList}
              />
            ))
          : Array.from({ length: 4 }).map((_, i) => <BlogPostBlockSkeleton key={i} />)}
      </Box>
    </>
  )
}
