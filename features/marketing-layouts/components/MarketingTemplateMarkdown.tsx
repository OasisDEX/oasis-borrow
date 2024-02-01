import React, { type FC } from 'react'
import Markdown from 'react-markdown'
import { Flex } from 'theme-ui'

interface MarketingTemplateMarkdownProps {
  content: string
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
      <Markdown>{content}</Markdown>
    </Flex>
  )
}
