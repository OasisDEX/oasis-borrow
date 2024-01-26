import { AppLink } from 'components/Links'
import { TokensGroup } from 'components/TokensGroup'
import { WithArrow } from 'components/WithArrow'
import type { MarketingTemplateInfoBoxProps } from 'features/marketing-layouts/types'
import React, { type FC } from 'react'
import { Flex, Heading, Image, Text } from 'theme-ui'

export const MarketingTemplateInfoBox: FC<MarketingTemplateInfoBoxProps> = ({
  description,
  image,
  link,
  title,
  tokens,
}) => {
  return (
    <Flex sx={{ columnGap: '168px' }}>
      <Flex sx={{ flexDirection: 'column', justifyContent: 'center' }}>
        <Heading as="h3" variant="header4">
          {title}
        </Heading>
        <Text as="p" variant="paragraph2" sx={{ mt: '12px', color: 'neutral80' }}>
          {description}
        </Text>
        {link && (
          <AppLink href={link.url} sx={{ display: 'inline-block', mt: '12px' }}>
            <WithArrow sx={{ fontSize: 3, color: 'interactive100' }}>{link.label}</WithArrow>
          </AppLink>
        )}
        {tokens && (
          <Flex as="ul" sx={{ m: 0, mt: '24px', p: 0, gap: 2, listStyle: 'none' }}>
            {tokens.map((token, i) => (
              <Flex
                as="li"
                key={i}
                sx={{
                  alignItems: 'center',
                  columnGap: 1,
                  py: 1,
                  pr: 3,
                  pl: 2,
                  border: '1px solid',
                  borderColor: 'neutral20',
                  borderRadius: 'circle',
                  bg: 'neutral10',
                }}
              >
                <TokensGroup tokens={[token]} forceSize={32} />
                <Text variant="boldParagraph2">{token}</Text>
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
      <Image src={image} sx={{ flexShrink: 0 }} />
    </Flex>
  )
}
