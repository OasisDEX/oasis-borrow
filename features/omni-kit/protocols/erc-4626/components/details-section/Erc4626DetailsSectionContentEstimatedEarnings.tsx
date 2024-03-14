import type BigNumber from 'bignumber.js'
import { Icon } from 'components/Icon'
import { TokensGroup } from 'components/TokensGroup'
import { StatefulTooltip } from 'components/Tooltip'
import { formatCryptoBalance } from 'helpers/formatters/format'
import type { FC, ReactNode } from 'react'
import React from 'react'
import { sparks } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

interface Erc4626DetailsSectionContentEstimatedEarningsProps {
  estimatedEarnings: BigNumber
  token: string
  tooltip?: ReactNode
  rewards?: {
    amount: BigNumber
    token: string
  }[]
}

export const Erc4626DetailsSectionContentEstimatedEarnings: FC<
  Erc4626DetailsSectionContentEstimatedEarningsProps
> = ({ estimatedEarnings, token, tooltip, rewards }) => {
  const icon = <Icon icon={sparks} size={16} color="interactive100" />

  return (
    <>
      <Flex
        sx={{
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'flex-end',
          columnGap: 1,
        }}
      >
        {formatCryptoBalance(estimatedEarnings)} {token}
        {(rewards || tooltip) && (
          <>
            {tooltip ? (
              <StatefulTooltip
                tooltip={tooltip}
                tooltipSx={{
                  top: '24px',
                  fontSize: 1,
                  border: 'none',
                  borderRadius: 'medium',
                  boxShadow: 'buttonMenu',
                  fontWeight: 'regular',
                  lineHeight: 'body',
                }}
              >
                {icon}
              </StatefulTooltip>
            ) : (
              icon
            )}
          </>
        )}
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
