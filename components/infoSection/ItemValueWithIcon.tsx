import { TokensGroup } from 'components/TokensGroup'
import type { FC } from 'react'
import React from 'react'
import { Flex } from 'theme-ui'

interface ItemValueWithIconProps {
  tokens: string[]
}

export const ItemValueWithIcon: FC<ItemValueWithIconProps> = ({ children, tokens }) => (
  <Flex sx={{ alignItems: 'center', columnGap: 1 }}>
    <TokensGroup tokens={tokens} forceSize={23} />
    {children}
  </Flex>
)
