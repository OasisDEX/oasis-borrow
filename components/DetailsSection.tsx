import React, { PropsWithChildren, ReactNode } from 'react'
import { Box, Card, Flex, Heading } from 'theme-ui'

import { ButtonWithAction, ButtonWithActions, ExpandableButton } from './ExpandableButton'
import { VaultTabTag } from './vault/VaultTabTag'

interface DetailsSectionProps {
  badge?: boolean
  buttons?: (ButtonWithAction | ButtonWithActions)[]
  content: ReactNode
  footer?: ReactNode
  title?: ReactNode
}

export function DetailsSection({ title, badge, buttons, content, footer }: DetailsSectionProps) {
  return (
    <Card
      sx={{
        p: 0,
        border: 'lightMuted',
      }}
    >
      {title && typeof title === 'string' && (
        <DetailsSectionTitle badge={badge} buttons={buttons}>
          {title}
        </DetailsSectionTitle>
      )}
      {title && typeof title !== 'string' && title}
      <Box
        sx={{
          px: [3, null, '24px'],
          py: '24px',
        }}
      >
        {content}
      </Box>
      {footer && (
        <Box
          sx={{
            p: [3, null, '24px'],
            borderTop: 'lightMuted',
          }}
        >
          {footer}
        </Box>
      )}
    </Card>
  )
}

interface DetailsSectionTitleProps {
  badge?: boolean
  buttons?: (ButtonWithAction | ButtonWithActions)[]
  children: ReactNode
}

export function DetailsSectionTitle({
  badge,
  buttons,
  children,
}: PropsWithChildren<DetailsSectionTitleProps>) {
  return (
    <Flex
      sx={{
        flexDirection: ['column', null, 'row'],
        justifyContent: 'space-between',
        mx: [3, null, '24px'],
        pt: 3,
        pb: ['24px', null, 3],
        borderBottom: 'lightMuted',
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          height: '40px',
        }}
      >
        {typeof children === 'string' ? (
          <Heading as="p" variant="boldParagraph2">
            {children}
          </Heading>
        ) : (
          children
        )}
        {badge !== undefined && <VaultTabTag isEnabled={badge} />}
      </Flex>
      {buttons && (
        <Flex
          sx={{
            mt: [2, null, 0],
          }}
        >
          {buttons?.map((button) => (
            <ExpandableButton button={button} key={button.label} />
          ))}
        </Flex>
      )}
    </Flex>
  )
}
