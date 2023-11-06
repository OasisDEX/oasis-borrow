import Avatar from 'boring-avatars'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAddress } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Text } from 'theme-ui'

export const PortfolioHeader = ({ address }: { address: string }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  return (
    <Flex
      sx={{
        flexDirection: ['column', 'row'],
        justifyContent: ['flex-start', 'space-between'],
        mb: 5,
      }}
    >
      <Flex sx={{ alignItems: 'center', mb: [4, 0] }}>
        <Avatar
          size={48}
          name={address}
          variant="pixel"
          colors={['#6FD9FF', '#F2FCFF', '#FFE7D8', '#FBB677']}
        />
        <Text variant="header5" sx={{ ml: 3 }}>
          {formatAddress(address, 6)}
        </Text>
      </Flex>
      <Flex sx={{ justifyContent: ['flex-start', 'flex-end'] }}>
        <AppLink href={`${EXTERNAL_LINKS.ETHERSCAN}/address/${address}`}>
          <Button variant="action">{tPortfolio('view-on-etherscan')}</Button>
        </AppLink>
      </Flex>
    </Flex>
  )
}
