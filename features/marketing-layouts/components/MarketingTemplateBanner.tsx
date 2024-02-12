import { AppLink } from 'components/Links'
import { MarketingTemplateMarkdown } from 'features/marketing-layouts/components/MarketingTemplateMarkdown'
import { renderCssGradient } from 'features/marketing-layouts/helpers'
import type {
  MarketingTemplateBannerProps,
  MarketingTemplatePalette,
} from 'features/marketing-layouts/types'
import { getNextParsedUrl } from 'helpers/getNextParsedUrl'
import React, { type FC } from 'react'
import { Flex, Heading } from 'theme-ui'

export const MarketingTemplateBanner: FC<
  MarketingTemplateBannerProps & { palette: MarketingTemplatePalette }
> = ({ cta: { label, url }, description, palette: { background }, title }) => {
  const { href, query } = getNextParsedUrl(url)

  return (
    <Flex
      sx={{
        flexDirection: ['column', 'row'],
        alignItems: 'center',
        justifyContent: 'space-between',
        rowGap: '24px',
        columnGap: 5,
        px: [4, 5],
        py: 5,
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'rounder',
        background: renderCssGradient('90deg', background),
      }}
    >
      <Flex sx={{ flexDirection: 'column', rowGap: 2 }}>
        <Heading variant="header4">{title}</Heading>
        {description && <MarketingTemplateMarkdown content={description} />}
      </Flex>
      <AppLink variant="primary" href={href} query={query} sx={{ flexShrink: 0, px: 4 }}>
        {label} →
      </AppLink>
    </Flex>
  )
}
