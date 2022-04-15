import React from 'react'
import { Card, Flex } from 'theme-ui'

import { VaultTabTag } from './vault/VaultTabTag'

interface IDetailsSectionProps {
  title?: string
  badge?: boolean
  content: string | JSX.Element
}

export function DetailsSection({ title, badge, content }: IDetailsSectionProps) {
  return (
    <Card
      sx={{
        p: 0,
        border: 'lightMuted',
      }}
    >
      {title && (
        <Flex
          sx={{
            px: "24px",
            py: 3,
            borderBottom: 'lightMuted',
          }}
        >
          <Flex
            as="h2"
            variant="headerSettings"
            sx={{
              alignItems: 'center',
              height: '36px',
              fontSize: 3,
            }}
          >
            {title}
            {badge !== undefined && <VaultTabTag isEnabled={badge} />}
          </Flex>
        </Flex>
      )}
      {content}
    </Card>
  )
}
