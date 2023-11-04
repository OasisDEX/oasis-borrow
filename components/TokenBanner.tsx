import { AppLink } from 'components/Links'
import { TokensGroup } from 'components/TokensGroup'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'

interface TokenBannerProps {
  cta: string
  tokens: string[]
  url: string
}

export function TokenBanner({ children, cta, tokens, url }: PropsWithChildren<TokenBannerProps>) {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        px: 3,
        py: '28px',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'large',
        background: 'linear-gradient(121deg, #D3F5FF 2.53%, #F2FCFF 52.06%, #FFE7D8 98.6%)',
      }}
    >
      <TokensGroup tokens={tokens} forceSize={32} sx={{ flexShrink: 0 }} />
      <Text as="p" variant="boldParagraph3" sx={{ px: 3 }}>
        {children}
      </Text>
      <AppLink href={url} sx={{ flexShrink: 0, ml: 'auto' }}>
        <Button variant="action">{cta}</Button>
      </AppLink>
    </Flex>
  )
}
