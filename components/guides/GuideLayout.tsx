// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import Link from 'next/link'
import React from 'react'
import { Box, Button, Container, Flex, Heading, Image, Text } from 'theme-ui'

export interface BlogPostType {
  title: string
  publishedAt: Date
  summary: string
  featuredImage: string
  slug: string
}

type BlogPostProps = BlogPostType & WithChildren

export function BlogPost({ title, publishedAt, featuredImage, children }: BlogPostProps) {
  return (
    <Container variant="blog" sx={{ color: 'onBackground', mb: 6, textAlign: 'center' }}>
      <Box sx={{ textAlign: 'left', mt: 4 }}>
        <Link href="/blog">
          <a>
            <Button variant="outline">
              <Flex>
                <Icon size="auto" name="left_arrow" width="20" height="13" />
                <Text sx={{ ml: 2 }}>Back to blog</Text>
              </Flex>
            </Button>
          </a>
        </Link>
      </Box>
      <Container variant="blogPost">
        <Box sx={{ textAlign: 'center' }}>
          <Heading as="h1" sx={{ mt: 4 }}>
            {title}
          </Heading>
          <Text sx={{ fontSize: 4, color: 'text', mt: 3, mb: 4 }}>{publishedAt}</Text>
          <Image
            src={featuredImage}
            sx={{ mb: 3, width: '100%', maxHeight: 7, borderRadius: 'medium' }}
          />
        </Box>
        <Box
          sx={{
            textAlign: 'left',
            fontSize: 4,
            mb: 3,
            pb: 4,
            borderBottom: 'light',
            borderColor: 'muted',
          }}
        >
          {children}
        </Box>
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Text sx={{ color: 'text' }}>{publishedAt}</Text>
        </Flex>
      </Container>
    </Container>
  )
}
