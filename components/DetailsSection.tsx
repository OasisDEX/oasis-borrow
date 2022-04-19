import React from 'react'
import { Card, Flex } from 'theme-ui'

import { ExpandableButton, IButtonWithAction, IButtonWithActions } from './ExpandableButton'
import { VaultTabTag } from './vault/VaultTabTag'

interface IDetailsSectionProps {
  title?: string
  badge?: boolean
  buttons?: (IButtonWithAction | IButtonWithActions)[]
  content: string | JSX.Element
}

export function DetailsSection({ title, badge, buttons, content }: IDetailsSectionProps) {
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
            flexDirection: ['column', null, 'row'],
            justifyContent: 'space-between',
            px: [3, null, '24px'],
            pt: 3,
            pb: ['24px', null, 3],
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
          <Flex
            sx={{
              mt: [2, 0],
            }}
          >
            {buttons?.map((button, i) => (
              <ExpandableButton button={button} key={i} />
            ))}
          </Flex>
        </Flex>
      )}
      {content}
    </Card>
  )
}
