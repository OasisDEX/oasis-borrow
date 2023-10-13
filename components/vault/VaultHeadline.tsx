import { Heading } from '@theme-ui/components'
import { ProtocolLabel } from 'components/ProtocolLabel'
import type { ProtocolLabelProps } from 'components/ProtocolLabel.types'
import { Skeleton } from 'components/Skeleton'
import { TokensGroup } from 'components/TokensGroup'
import {
  ShareButton,
  twitterSharePositionText,
  twitterSharePositionVia,
} from 'features/follow/common/ShareButton'
import type { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { FollowButtonControl } from 'features/follow/controllers/FollowButtonControl'
import type { ReactNode } from 'react'
import React from 'react'
import { Flex } from 'theme-ui'

import type { HeadlineDetailsProp } from './VaultHeadlineDetails'
import { VaultHeadlineDetails } from './VaultHeadlineDetails'

export type VaultHeadlineProps = {
  details: HeadlineDetailsProp[]
  followButton?: FollowButtonControlProps
  header: ReactNode
  loading?: boolean
  onClick?: () => void
  protocol?: ProtocolLabelProps
  shareButton?: boolean
  tokens?: string[]
}

export function VaultHeadline({
  details,
  followButton,
  header,
  loading = false,
  onClick,
  protocol,
  shareButton,
  tokens = [],
}: VaultHeadlineProps) {
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
      onClick={onClick}
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
            flexWrap: 'wrap',
            maxWidth: '100%',
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
          {followButton && <FollowButtonControl {...followButton} />}
          {shareButton && (
            <ShareButton
              text={twitterSharePositionText}
              url={document.location.href.replace(document.location.hash, '')}
              via={twitterSharePositionVia}
            />
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
