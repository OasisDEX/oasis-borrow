import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { Skeleton } from 'components/Skeleton'
import { WithArrow } from 'components/WithArrow'
import dayjs from 'dayjs'
import type { ParsedBlogPost } from 'helpers/types/blog-posts.types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { clock } from 'theme/icons'
import { Box, Flex, Image, Text } from 'theme-ui'

interface PortfolioPositionLearnProps {
  posts?: ParsedBlogPost[]
}

export const PortfolioPositionLearn = ({ posts }: PortfolioPositionLearnProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  return (
    <Flex
      as="ul"
      sx={{ flexDirection: ['column', 'row'], columnGap: '24px', p: 0, m: 0, listStyle: 'none' }}
    >
      {posts ? (
        <>
          {posts.map(({ date, image, readingTime, title, url }, i) => (
            <Flex
              key={`post-${i}`}
              as="li"
              sx={{
                flexDirection: 'column',
                flex: '0 1 100%',
                border: '1px solid',
                borderColor: 'neutral20',
                borderRadius: 'large',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ height: '205px' }}>
                <Image
                  src={image}
                  alt={title}
                  sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Flex sx={{ flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1, p: 3 }}>
                <Flex
                  variant="text.paragraph4"
                  sx={{
                    alignItems: 'center',
                    columnGap: 1,
                    mb: 2,
                    px: 3,
                    py: 1,
                    color: 'neutral80',
                    border: '1px solid',
                    borderColor: 'neutral20',
                    borderRadius: 'large',
                  }}
                >
                  <Icon icon={clock} size="14px" />
                  {readingTime} min.
                </Flex>
                <Text as="p" variant="boldParagraph2">
                  {title}
                </Text>
                <Flex sx={{ justifyContent: 'space-between', width: '100%', mt: 'auto', pt: 3 }}>
                  <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                    {dayjs(date).format('MMMM DD, YYYY')}
                  </Text>
                  <AppLink href={url} sx={{ mr: 3 }}>
                    <WithArrow sx={{ color: 'interactive100' }}>
                      {tPortfolio('read-article')}
                    </WithArrow>
                  </AppLink>
                </Flex>
              </Flex>
            </Flex>
          ))}
        </>
      ) : (
        <>
          {Array.from({ length: 2 }).map((_, i) => (
            <Box key={`skeleton-${i}`} as="li" sx={{ flexGrow: 1 }}>
              <Skeleton height="340px" />
            </Box>
          ))}
        </>
      )}
    </Flex>
  )
}
