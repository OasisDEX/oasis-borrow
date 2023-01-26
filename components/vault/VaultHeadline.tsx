import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import { getTokens } from 'blockchain/tokensMetadata'
import {
  FollowButtonControl,
  FollowButtonControlProps,
} from 'features/follow/common/FollowButtonControl'
import {
  ShareButton,
  twitterSharePositionText,
  twitterSharePositionVia,
} from 'features/follow/common/ShareButton'
import { AppSpinner } from 'helpers/AppSpinner'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Box, Flex, Image } from 'theme-ui'

import { HeadlineDetailsProp, VaultHeadlineDetails } from './VaultHeadlineDetails'

export type VaultHeadlineProps = {
  details: HeadlineDetailsProp[]
  followButton?: FollowButtonControlProps
  header: string
  label?: string
  loading?: boolean
  outline?: {
    color: string
    size: number
  }
  shareButton?: boolean
  token: string[]
}

export function VaultHeadline({
  details,
  followButton,
  header,
  label,
  loading = false,
  outline,
  shareButton,
  token,
}: VaultHeadlineProps) {
  const tokenData = getTokens(token)
  const followVaultEnabled = useFeatureToggle('FollowVaults')

  return (
    <Flex
      sx={{
        flexDirection: ['column', 'column', null, 'row'],
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
          alignItems: 'center',
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
        {followVaultEnabled && (
          <Flex sx={{ alignItems: 'center', columnGap: 2, ml: 3 }}>
            {followButton && <FollowButtonControl {...followButton} />}
            {shareButton && (
              <ShareButton
                text={twitterSharePositionText}
                url={document.location.href.replace(document.location.hash, '')}
                via={twitterSharePositionVia}
              />
            )}
          </Flex>
        )}
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
