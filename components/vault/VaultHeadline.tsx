import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import { getTokens } from 'blockchain/tokensMetadata'
import { ProtocolLabel, ProtocolLabelProps } from 'components/ProtocolLabel'
import { Skeleton } from 'components/Skeleton'
import {
  ShareButton,
  twitterSharePositionText,
  twitterSharePositionVia,
} from 'features/follow/common/ShareButton'
import {
  FollowButtonControl,
  FollowButtonControlProps,
} from 'features/follow/controllers/FollowButtonControl'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { ReactNode } from 'react'
import { Box, Flex, Image } from 'theme-ui'

import { HeadlineDetailsProp, VaultHeadlineDetails } from './VaultHeadlineDetails'

export type VaultHeadlineProps = {
  details: HeadlineDetailsProp[]
  followButton?: FollowButtonControlProps
  header: ReactNode
  label?: string
  loading?: boolean
  shareButton?: boolean
  token?: string[]
  handleClick?: () => void
  protocol?: ProtocolLabelProps
}

export function VaultHeadline({
  details,
  followButton,
  header,
  label,
  loading = false,
  shareButton,
  token = [],
  handleClick,
  protocol,
}: VaultHeadlineProps) {
  const tokenData = getTokens(token)
  const followVaultEnabled = useFeatureToggle('FollowVaults')

  return (
    <Flex
      sx={{
        flexWrap: 'wrap',
        flexShrink: 0,
        flexDirection: ['column', 'column', null, 'row'],
        justifyContent: 'space-between',
        alignItems: ['flex-start', null, null, 'center'],
        gap: 3,
      }}
      onClick={handleClick}
    >
      <Heading
        as="h1"
        variant="heading1"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          fontWeight: 'semiBold',
          fontSize: '28px',
          color: 'primary100',
          wordBreak: 'break-word',
        }}
      >
        {/* tokens & title */}
        <Flex
          sx={{
            flexDirection: 'row',
            flexShrink: 0,
            alignItems: 'center',
            columnGap: 2,
          }}
        >
          {tokenData instanceof Array && tokenData.length > 0 && (
            <Box sx={{ mr: 2, flexShrink: 0 }}>
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
        </Flex>
        {/* protocol label & icon buttons */}
        <Flex
          sx={{
            flexDirection: 'row',
            flexShrink: 0,
            alignItems: 'center',
            columnGap: 2,
            '&:hover': {
              '.tooltip': {
                whiteSpace: 'nowrap',
              },
            },
          }}
        >
          {protocol && <ProtocolLabel network={protocol.network} protocol={protocol.protocol} />}
          {followVaultEnabled && (
            <>
              {followButton && <FollowButtonControl {...followButton} />}
              {shareButton && (
                <ShareButton
                  text={twitterSharePositionText}
                  url={document.location.href.replace(document.location.hash, '')}
                  via={twitterSharePositionVia}
                />
              )}
            </>
          )}
        </Flex>
      </Heading>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
        }}
      >
        {!loading &&
          details.map((detail) => (
            <VaultHeadlineDetails {...detail} key={`VaultHeadlineDetails_${detail.label}`} />
          ))}
        {loading && <Skeleton width="250px" height="24px" />}
      </Flex>
    </Flex>
  )
}
