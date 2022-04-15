import React from 'react'
import { Button, Card, Flex } from 'theme-ui'

import { VaultTabTag } from './vault/VaultTabTag'

interface IDetailsSectionProps {
  title?: string
  badge?: boolean
  buttons?: Array<any>
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
            justifyContent: 'space-between',
            px: '24px',
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
          <Flex>
            {buttons?.map((button, i) => (
              <Button
                key={i}
                onClick={button.action}
                variant="action"
                sx={{
                  px: '24px',
                  py: 2,
                  fontFamily: 'body',
                  fontSize: 1,
                  fontWeight: 'semiBold',
                  lineHeight: '18px',
                  color: 'primary',
                  backgroundColor: 'background',
                  border: 'lightMuted',
                  borderRadius: 'rounder',
                  cursor: 'pointer',
                }}
              >
                {button.label}
              </Button>
            ))}
          </Flex>
        </Flex>
      )}
      {content}
    </Card>
  )
}
