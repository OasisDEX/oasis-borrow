import { Icon } from '@makerdao/dai-ui-icons'
import React, { ReactNode } from 'react'
import { Text } from 'theme-ui'

interface EstimationOnCloseProps {
  iconCircle: string
  label: string
  value: ReactNode
}

export function EstimationOnClose({ iconCircle, label, value }: EstimationOnCloseProps) {
  return (
    <Text
      as="p"
      variant="paragraph3"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 'semiBold',
      }}
    >
      <Text as="span" sx={{ display: 'flex', color: 'neutral80' }}>
        <Icon name={iconCircle} size="24px" sx={{ mt: '-1px', mr: 1 }} />
        {label}
      </Text>
      <Text as="span" sx={{ display: 'block', height: '100%' }}>
        {value}
      </Text>
    </Text>
  )
}
