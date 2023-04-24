import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Divider, Flex, Text } from '@theme-ui/components'
import { AppLink } from 'components/Links'
import { WithChildren } from 'helpers/types'
import React, { ReactNode } from 'react'

export function VaultFormVaultTypeSwitch({
  href,
  title,
  visible,
}: {
  href: string
  title: ReactNode
  visible: boolean
}) {
  return visible ? (
    <>
      <Divider variant="styles.hrVaultFormBottom" />
      <Box>
        <AppLink
          href={href}
          sx={{
            color: 'primary100',
            fontWeight: 'semiBold',
            fontSize: 3,
            display: 'block',
          }}
        >
          <Flex
            sx={{
              variant: 'links.nav',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 3,
            }}
          >
            <Text mr={2}>{title}</Text>
            <Icon sx={{ ml: 1 }} name="arrow_right" />
          </Flex>
        </AppLink>
      </Box>
    </>
  ) : (
    <></>
  )
}

export function WithVaultFormStepIndicator({
  currentStep,
  totalSteps,
  children,
}: {
  currentStep: number
  totalSteps: number
} & WithChildren) {
  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Box
        sx={{
          color: 'neutral80',
          fontSize: 1,
          fontWeight: 'semiBold',
          border: 'lightMuted',
          borderRadius: 'large',
          px: 3,
        }}
      >
        <Box sx={{ position: 'relative', top: '1px' }}>
          <Text as="span" sx={{ color: 'primary100', fontSize: 3 }}>
            {currentStep}
          </Text>{' '}
          / {totalSteps}
        </Box>
      </Box>
    </Flex>
  )
}
