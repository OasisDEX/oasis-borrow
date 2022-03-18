import { formatAddress } from 'helpers/formatters/format'
import React from 'react'
import { Flex, Text } from 'theme-ui'

export function AccountIndicator({
  address,
  ensName,
}: {
  address: string
  ensName: string | null
}) {
  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mx: 3 }}>
      <Text variant="paragraph4" sx={{ fontWeight: 'bold' }}>
        {ensName || formatAddress(address)}
      </Text>
    </Flex>
  )
}
