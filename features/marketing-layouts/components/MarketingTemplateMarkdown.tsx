import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { type Document as ContentfulDocument } from '@contentful/rich-text-types'
import React, { type FC } from 'react'
import { Flex } from 'theme-ui'

interface MarketingTemplateMarkdownProps {
  content: ContentfulDocument
}

export const MarketingTemplateMarkdown: FC<MarketingTemplateMarkdownProps> = ({ content }) => {
  return (
    <Flex
      variant="text.paragraph2"
      sx={{
        flexDirection: 'column',
        rowGap: '12px',
        color: 'neutral80',
        '*': { m: 0 },
        a: { color: 'interactive100', textDecoration: 'none' },
        'ul, ol': { pl: '24px' },
      }}
    >
      {documentToReactComponents(content)}
    </Flex>
  )
}
