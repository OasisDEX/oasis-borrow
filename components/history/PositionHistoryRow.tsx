import React, { FC } from 'react'
import { DefinitionListItem } from 'components/DefinitionList'
import { Text } from 'theme-ui'

interface PositionHistoryRowProps {
  label: string
}

export const PositionHistoryRow: FC<PositionHistoryRowProps> = ({ label, children }) => {
  return (
    <DefinitionListItem sx={{ display: 'flex', justifyContent: 'space-between', pl: 3, pr: 2 }}>
      <Text
        as="span"
        sx={{
          color: 'neutral80',
          pr: 2,
        }}
      >
        {label}
      </Text>
      <Text
        as="span"
        sx={{
          flexShrink: 0,
          color: 'primary100',
        }}
      >
        {children}
      </Text>
    </DefinitionListItem>
  )
}
