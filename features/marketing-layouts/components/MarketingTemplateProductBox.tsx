import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { MarketingTemplateMarkdown } from 'features/marketing-layouts/components'
import { renderCssGradient } from 'features/marketing-layouts/helpers'
import type {
  MarketingTemplatePalette,
  MarketingTemplateProductBoxProps,
} from 'features/marketing-layouts/types'
import { getNextParsedUrl } from 'helpers/getNextParsedUrl'
import React, { type FC, useMemo } from 'react'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Box, Flex, Heading, Image, Text } from 'theme-ui'

export const MarketingTemplateProductBox: FC<
  MarketingTemplateProductBoxProps & { index: number; palette: MarketingTemplatePalette }
> = ({
  actionsList,
  composition,
  contentImage,
  description,
  image,
  index,
  link,
  palette: { background },
  title,
  type,
}) => {
  const isMobile = useOnMobile()
  const isNarrow = composition === 'narrow' || isMobile

  const linkComponent = useMemo(() => {
    if (link) {
      const { href, query } = getNextParsedUrl(link.url)

      return (
        <AppLink href={href} query={query} sx={{ display: 'inline-block', mt: 3 }}>
          <WithArrow sx={{ fontSize: 3, color: 'interactive100' }}>{link.label}</WithArrow>
        </AppLink>
      )
    } else return <></>
  }, [link])

  return (
    <Flex
      sx={{
        gridArea: ['unset', `p-${index}`],
        position: 'relative',
        flexDirection: 'column',
        alignItems: isNarrow ? 'flex-start' : actionsList ? 'stretch' : 'center',
        justifyContent: isNarrow || image ? 'flex-start' : 'center',
        minHeight: '486px',
        p: isNarrow ? 4 : 5,
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'rounder',
        background: renderCssGradient('180deg', background),
        overflow: 'hidden',
      }}
    >
      <Flex
        sx={{
          position: 'relative',
          flexDirection: isNarrow ? 'column' : 'row',
          alignItems: isNarrow ? 'flex-start' : 'center',
          rowGap: 4,
          columnGap: '80px',
          textAlign: !isNarrow && !actionsList ? 'center' : 'left',
          zIndex: 2,
        }}
      >
        <Box sx={{ flex: '1' }}>
          {type && (
            <Text variant="boldParagraph3" sx={{ mb: 1, color: 'neutral80' }}>
              {type}
            </Text>
          )}
          <Heading as="h3" variant="header4" sx={{ mb: 2 }}>
            {title}
          </Heading>
          {description && <MarketingTemplateMarkdown content={description} />}
          {linkComponent}
          {contentImage && <Image src={contentImage} sx={{ mt: 3 }} />}
        </Box>
        {actionsList && (
          <Flex sx={{ flex: '1', justifyContent: isNarrow ? 'flex-start' : 'center' }}>
            <Flex
              as="ul"
              sx={{ flexDirection: 'column', m: 0, p: 0, rowGap: 4, listStyle: 'none' }}
            >
              {actionsList.map(({ description: actionListDescription, icon, label }, i) => (
                <Flex as="li" key={i} sx={{ alignItems: 'center', columnGap: '12px' }}>
                  <Image
                    src={icon}
                    sx={{ width: '56px', filter: 'drop-shadow(0 0 12px rgba(0, 0, 0, 0.1))' }}
                  />
                  <Box>
                    <Text as="p" variant="boldParagraph2">
                      {label}
                    </Text>
                    {actionListDescription && (
                      <Text as="p" variant="paragraph4" sx={{ color: 'neutral80' }}>
                        {actionListDescription}
                      </Text>
                    )}
                  </Box>
                </Flex>
              ))}
            </Flex>
          </Flex>
        )}
      </Flex>
      <Image
        src={image}
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          left: isNarrow ? 'auto' : 0,
          margin: 'auto',
          maxWidth: '90%',
          pointerEvents: 'none',
        }}
      />
    </Flex>
  )
}
