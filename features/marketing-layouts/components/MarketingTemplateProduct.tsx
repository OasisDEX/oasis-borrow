import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { renderCssGradient } from 'features/marketing-layouts/helpers'
import type { MarketingTemplateProductsProps } from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { Flex, Heading, Image, Text } from 'theme-ui'

export const MarketingTemplateProduct: FC<
  MarketingTemplateProductsProps & { i: number; mainGradient: string[] }
> = ({ actionsList, composition, description, i, image, link, mainGradient, title, type }) => {
  const isNarrow = composition === 'narrow'

  return (
    <Flex
      sx={{
        gridArea: `p-${i}`,
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
        <AppLink href={link.url} sx={{ mt: 3 }}>
          <WithArrow sx={{ fontSize: 3, color: 'interactive100' }}>
            {link.label}
          </WithArrow>
        </AppLink>
      )}
      <Image
        src={image}
        sx={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none' }}
      />
    </Flex>
  )
}
