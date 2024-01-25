import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { renderCssGradient } from 'features/marketing-layouts/helpers'
import type { MarketingTemplateProductsProps } from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Box, Flex, Heading, Image, Text } from 'theme-ui'

export const MarketingTemplateProduct: FC<
  MarketingTemplateProductsProps & { i: number; mainGradient: string[] }
> = ({ actionsList, composition, description, i, image, link, mainGradient, title, type }) => {
  const isMobile = useOnMobile()
  const isNarrow = composition === 'narrow' || isMobile

  return (
    <Flex
      sx={{
        gridArea: ['unset', `p-${i}`],
        position: 'relative',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: isNarrow ? 'flex-start' : 'center',
        minHeight: '486px',
        p: isNarrow ? 4 : 5,
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'rounder',
        background: renderCssGradient('180deg', mainGradient),
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Text variant="boldParagraph3" sx={{ color: 'neutral80' }}>
          {type}
        </Text>
        <Heading as="h3" variant="header4" sx={{ mt: 1, mb: 2 }}>
          {title}
        </Heading>
        <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
          {description}
        </Text>
        {link && (
          <AppLink href={link.url} sx={{ display: 'inline-block', mt: 3 }}>
            <WithArrow sx={{ fontSize: 3, color: 'interactive100' }}>{link.label}</WithArrow>
          </AppLink>
        )}
      </Box>
      <Image
        src={image}
        sx={{ position: 'absolute', bottom: 0, right: 0, maxWidth: '90%', pointerEvents: 'none' }}
      />
    </Flex>
  )
}
