import { Icon } from 'components/Icon'
import type { FC } from 'react'
import React from 'react'
import { checkmark } from 'theme/icons'
import { Text } from 'theme-ui'

type PillProps = {}

export const Pill: FC<PillProps> = ({ children }) => {
  return (
    <div
      className="Pill"
      style={{
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 4,
        paddingBottom: 4,
        background: '#F3F7F9',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        display: 'inline-flex',
      }}
    >
      <Icon icon={checkmark} color="interactive100" size="auto" width="12px" />
      <Text variant="paragraph4" color="neutral80">
        {children}
      </Text>
    </div>
  )
}
