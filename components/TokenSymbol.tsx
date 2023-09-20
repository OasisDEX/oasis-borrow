import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import type { ComponentProps } from 'react'
import React from 'react'
import { Flex, Text } from 'theme-ui'

export function TokenSymbol({
  token,
  displaySymbol,
  ...props
}: { token: string; displaySymbol?: boolean } & Omit<ComponentProps<typeof Icon>, 'name'>) {
  const tokenInfo = getToken(token)

  return (
    <Flex>
      <Icon
        name={tokenInfo.iconCircle}
        size="26px"
        sx={{ verticalAlign: 'sub', mr: 2 }}
        {...props}
      />
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', whiteSpace: 'nowrap' }}>
        {tokenInfo[displaySymbol ? 'symbol' : 'name']}
      </Text>
    </Flex>
  )
}
