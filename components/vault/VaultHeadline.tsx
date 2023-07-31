import { Heading } from '@theme-ui/components'
import { ProtocolLabel, ProtocolLabelProps } from 'components/ProtocolLabel'
import { Skeleton } from 'components/Skeleton'
import { TokensGroup } from 'components/TokensGroup'
import {
  ShareButton,
  twitterSharePositionText,
  twitterSharePositionVia,
} from 'features/follow/common/ShareButton'
import {
  FollowButtonControl,
  FollowButtonControlProps,
} from 'features/follow/controllers/FollowButtonControl'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { ReactNode } from 'react'
import { Flex } from 'theme-ui'

import { HeadlineDetailsProp, VaultHeadlineDetails } from './VaultHeadlineDetails'

export type VaultHeadlineProps = {
  details: HeadlineDetailsProp[]
  followButton?: FollowButtonControlProps
  header: ReactNode
  loading?: boolean
  shareButton?: boolean
  tokens?: string[]
  handleClick?: () => void
  protocol?: ProtocolLabelProps
}

export function VaultHeadline({
  details,
  followButton,
  header,
  loading = false,
  shareButton,
  tokens = [],
  handleClick,
  protocol,
}: VaultHeadlineProps) {
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
          {tokens.length > 0 && (
            <TokensGroup tokens={tokens} forceSize={32} sx={{ mt: '2px', mr: 2, flexShrink: 0 }} />
          )}
          {header}
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
          {protocol && (
            <Flex sx={{ ml: [0, 3] }}>
              <ProtocolLabel network={protocol.network} protocol={protocol.protocol} />
            </Flex>
          )}
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
