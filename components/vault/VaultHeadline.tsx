import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import { getTokens } from 'blockchain/tokensMetadata'
import { AppSpinner } from 'helpers/AppSpinner'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box, Flex, Image } from 'theme-ui'

import { HeadlineDetailsProp, VaultHeadlineDetails } from './VaultHeadlineDetails'

export type VaultHeadlineProps = {
  details: HeadlineDetailsProp[]
  header: string
  label?: string
  loading?: boolean
  outline?: {
    color: string
    size: number
  }
  token: string[]
}

export function VaultHeadline({
  details,
  header,
  label,
  loading = false,
  outline,
  token,
}: VaultHeadlineProps) {
  const tokenData = getTokens(token)
  return (
    <Flex
      sx={{
        flexDirection: ['column', null, null, 'row'],
        justifyContent: 'space-between',
        alignItems: ['flex-start', null, null, 'center'],
        mb: 4,
      }}
    >
      <Heading
        as="h1"
        variant="heading1"
        sx={{
          display: 'flex',
          fontWeight: 'semiBold',
          fontSize: '28px',
          color: 'primary100',
        }}
      >
        {tokenData instanceof Array && tokenData.length > 0 && (
          <Box
            sx={{
              mr: 2,
              ...(outline && {
                filter: `
                  drop-shadow(${outline.size}px ${outline.size}px 0 ${outline.color})
                  drop-shadow(${outline.size}px -${outline.size}px 0 ${outline.color})
                  drop-shadow(-${outline.size}px ${outline.size}px 0 ${outline.color})
                  drop-shadow(-${outline.size}px -${outline.size}px 0 ${outline.color})
                `,
              }),
            }}
          >
            {tokenData.map(({ iconCircle }, iconIndex) => (
              <Icon
                key={`VaultHeadlineIcon_${iconCircle}`}
                name={iconCircle}
                size="32px"
                sx={{
                  verticalAlign: 'text-bottom',
                  position: 'relative',
                  zIndex: tokenData.length - iconIndex,
                  mr: tokenData.length - 1 === iconIndex ? 0 : '-16px',
                }}
              />
            ))}
          </Box>
        )}
        {header}
        {label && <Image src={staticFilesRuntimeUrl(label)} sx={{ ml: 3 }} />}
      </Heading>
      <Flex
        sx={{
          mt: ['24px', null, null, 0],
          flexDirection: ['column', 'row'],
        }}
      >
        {!loading &&
          details.map((detail) => (
            <VaultHeadlineDetails {...detail} key={`VaultHeadlineDetails_${detail.label}`} />
          ))}
        {loading && <AppSpinner variant="styles.spinner.large" />}
      </Flex>
    </Flex>
  )
}
