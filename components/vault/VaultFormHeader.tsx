import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Divider, Flex, Text } from '@theme-ui/components'
import { AppLink } from 'components/Links'
import React, { ReactNode } from 'react'

export function VaultFormHeaderSwitch({ href, title }: { href: string; title: ReactNode }) {
  return (
    <>
      <Box>
        <AppLink
          href={href}
          sx={{
            color: 'primary',
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
      <Divider variant="styles.hrVaultFormTop" />
    </>
  )
}
