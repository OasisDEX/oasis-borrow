import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { Card, Flex, Text } from 'theme-ui'

export function CloseVaultCard({
  text,
  icon,
  optionName,
  onClick,
  isActive,
}: {
  text: string
  icon: string
  optionName: string
  onClick: (optionName: string) => void
  isActive: boolean
}) {
  return (
    <Card
      sx={{
        borderRadius: 'mediumLarge',
        fontWeight: 'semiBold',
        fontSize: 2,
        py: 4,
        cursor: 'pointer',
        ...(isActive
          ? {
              boxShadow: 'actionCard',
              border: '1px solid',
              borderColor: 'neutral70',
            }
          : {}),
      }}
      onClick={() => onClick(optionName)}
    >
      <Flex
        sx={{
          alignItems: 'center',
          px: 2,
          lineHeight: 2,
          justifyContent: 'center',
          flexDirection: ['column', 'row'],
        }}
      >
        <Icon name={icon} size="auto" width="26px" height="26px" sx={{ mr: [0, 2] }} />
        <Text ml={1}>{text}</Text>
      </Flex>
    </Card>
  )
}
