import { Icon } from '@makerdao/dai-ui-icons'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Flex, Text } from 'theme-ui'

export function TextWithCheckmark({ children }: WithChildren) {
  return (
    <Flex sx={{ alignItems: 'center' }}>
      <Flex
        sx={{
          width: '20px',
          height: '20px',
          border: '2px solid',
          borderColor: 'success100',
          borderRadius: '50%',
          mr: 3,
          alignItems: 'center',
          justifyContent: 'center',
          color: 'success100',
          flexShrink: 0,
        }}
      >
        <Icon name="checkmark" size="auto" width="11px" sx={{ position: 'relative', top: '1px' }} />
      </Flex>
      <Text>{children}</Text>
    </Flex>
  )
}
