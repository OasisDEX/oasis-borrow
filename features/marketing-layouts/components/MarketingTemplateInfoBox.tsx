import { AppLink } from 'components/Links'
import { TokensGroup } from 'components/TokensGroup'
import { WithArrow } from 'components/WithArrow'
import { MarketingTemplateMarkdown } from 'features/marketing-layouts/components'
import type { MarketingTemplateInfoBoxProps } from 'features/marketing-layouts/types'
import { getNextParsedUrl } from 'helpers/getNextParsedUrl'
import React, { type FC, useMemo } from 'react'
import { Flex, Heading, Image, Text } from 'theme-ui'

export const MarketingTemplateInfoBox: FC<MarketingTemplateInfoBoxProps> = ({
  description,
  image,
  link,
  title,
  tokens,
}) => {
  const linkComponent = useMemo(() => {
    if (link) {
      const { href, query } = getNextParsedUrl(link.url)

      return (
        <AppLink href={href} query={query} sx={{ display: 'inline-block', mt: '12px' }}>
          <WithArrow sx={{ fontSize: 3, color: 'interactive100' }}>{link.label}</WithArrow>
        </AppLink>
      )
    } else return <></>
  }, [link])

  return (
    <Flex
      sx={{
        flexDirection: ['column-reverse', 'row'],
        alignItems: 'flex-start',
        rowGap: '24px',
        columnGap: [0, 5, null, '168px'],
      }}
    >
      <Flex sx={{ flexDirection: 'column', alignSelf: 'center' }}>
        <Heading as="h3" variant="header4" sx={{ mb: '12px' }}>
          {title}
        </Heading>
        <MarketingTemplateMarkdown content={description} />
        {linkComponent}
        {tokens && (
          <Flex
            as="ul"
            sx={{ flexWrap: 'wrap', m: 0, mt: '24px', p: 0, gap: 2, listStyle: 'none' }}
          >
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
      <Image
        src={image}
        sx={{ width: ['100%', 'auto'], maxWidth: ['100%', '50%', 'none'], flexShrink: 0 }}
      />
    </Flex>
  )
}
