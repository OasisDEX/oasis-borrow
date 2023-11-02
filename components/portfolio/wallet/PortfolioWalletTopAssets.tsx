import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { TokensGroup } from 'components/TokensGroup'
import { formatFiatBalance } from 'helpers/formatters/format'
import React from 'react'
import { Flex, Text } from 'theme-ui'

interface PortfolioWalletTopAssetsProps {
  assets: {
    asset: string
    network: NetworkNames
    value: number
  }[]
}

export const PortfolioWalletTopAssets = ({ assets }: PortfolioWalletTopAssetsProps) => {
  return (
    <Flex
      as="ul"
      sx={{
        columnGap: 2,
        m: 0,
        p: 0,
        listStyle: 'none',
      }}
    >
      {assets.map(({ asset, network, value }) => (
        <Flex
          key={`${network}-${asset}`}
          as="li"
          sx={{
            flexGrow: 1,
            p: 2,
            border: '1px solid',
            borderColor: 'neutral20',
            borderRadius: 'medium',
            maxWidth: 'calc(33% - 4px)',
          }}
        >
          <TokensGroup tokens={[asset]} forceSize={40} network={network} />
          <Flex sx={{ flexDirection: 'column', pl: 2 }}>
            <Text as="span" variant="paragraph4" sx={{ color: 'neutral80' }}>
              {asset}
            </Text>
            <Text as="span" variant="boldParagraph3">
              ${formatFiatBalance(new BigNumber(value))}
            </Text>
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}
