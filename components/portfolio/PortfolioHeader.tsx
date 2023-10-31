import Avatar from 'boring-avatars'
import { formatAddress } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Text } from 'theme-ui'

export const PortfolioHeader = ({ address }: { address: string }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  return (
    <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 5 }}>
      <Flex sx={{ alignItems: 'center' }}>
        <Avatar
          size={48}
          name={address}
          variant="sunset"
          colors={['#6FD9FF', '#F2FCFF', '#FFE7D8', '#FBB677']}
        />
        <Text variant="header5" sx={{ ml: 3 }}>
          {formatAddress(address, 6)}
        </Text>
      </Flex>
      <Flex sx={{ justifyContent: 'flex-end' }}>
        <Button variant="secondary">{tPortfolio('view-on-etherscan')}</Button>
      </Flex>
    </Flex>
  )
}
