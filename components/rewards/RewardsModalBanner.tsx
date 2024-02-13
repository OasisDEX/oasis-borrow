import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import type { FC } from 'react'
import React from 'react'
import { Flex, Text } from 'theme-ui'

interface RewardsModalBannerProps {
  value: string
  unit: string
  subValue: string
  icon?: IconProps['icon']
}

export const RewardsModalBanner: FC<RewardsModalBannerProps> = ({
  value,
  subValue,
  icon,
  unit,
}) => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        borderRadius: '16px',
        border: '1px solid #EAEAEA',
        background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
        px: 3,
        py: 3,
      }}
    >
      {icon && <Icon size={45} icon={icon} sx={{ mr: 2 }} />}
      <Flex sx={{ flexDirection: 'column' }}>
        <Text as="span" sx={{ fontSize: '28px', fontWeight: 'bold' }}>
          {value}{' '}
          <Text as="span" sx={{ fontSize: 5 }}>
            {unit}
          </Text>
        </Text>
        {subValue && (
          <Text as="span" sx={{ color: 'neutral80', fontSize: 2, fontWeight: 'bold' }}>
            {subValue}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
