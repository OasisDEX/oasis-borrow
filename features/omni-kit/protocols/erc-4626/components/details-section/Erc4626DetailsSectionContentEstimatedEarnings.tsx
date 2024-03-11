import type BigNumber from 'bignumber.js'
import { Icon } from 'components/Icon'
import { TokensGroup } from 'components/TokensGroup'
import { formatCryptoBalance, formatUsdValue } from 'helpers/formatters/format'
import type { FC } from 'react'
import React from 'react'
import { sparks } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

interface Erc4626DetailsSectionContentEstimatedEarningsProps {
  estimatedEarnings: BigNumber
  rewards?: {
    amount: BigNumber
    token: string
  }[]
}

export const Erc4626DetailsSectionContentEstimatedEarnings: FC<
  Erc4626DetailsSectionContentEstimatedEarningsProps
> = ({ estimatedEarnings, rewards }) => {
  return (
    <>
      <Flex sx={{ alignItems: 'center', justifyContent: 'flex-end', columnGap: 1 }}>
        {formatUsdValue(estimatedEarnings)}{' '}
        {rewards && <Icon icon={sparks} size={16} color="interactive100" />}
      </Flex>
      {rewards?.map(({ amount, token }, i) => (
        <Flex key={i} sx={{ alignItems: 'center', justifyContent: 'flex-end', columnGap: 1 }}>
          <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
            +{formatCryptoBalance(amount)} {token}
          </Text>
          <TokensGroup tokens={[token]} forceSize={16} />
        </Flex>
      ))}
    </>
  )
}
