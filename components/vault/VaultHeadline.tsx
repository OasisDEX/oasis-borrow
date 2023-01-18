import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import { getTokens } from 'blockchain/tokensMetadata'
import { FollowButtonControl, FollowButtonProps } from 'features/follow/common/FollowButtonControl'
import { AppSpinner } from 'helpers/AppSpinner'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Flex } from 'theme-ui'

import { HeadlineDetailsProp, VaultHeadlineDetails } from './VaultHeadlineDetails'

export type VaultHeadlineProps = {
  header: string
  token: string[]
  details: HeadlineDetailsProp[]
  loading?: boolean
  followButtonProps?: FollowButtonProps
}

export function VaultHeadline({
  header,
  token,
  details,
  loading = false,
  followButtonProps,
}: VaultHeadlineProps) {
  const tokenData = getTokens(token)
  const followVaultEnabled = useFeatureToggle('FollowVaults')
  return (
    <Flex
      sx={{
        flexDirection: ['column', 'column', null, 'row'],
        justifyContent: 'space-between',
        alignItems: ['flex-start', null, null, 'flex-end'],
        mb: 4,
      }}
    >
      <Heading
        as="h1"
        variant="heading1"
        sx={{
          fontWeight: 'semiBold',
          fontSize: '28px',
          color: 'primary100',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {tokenData instanceof Array &&
          tokenData.map(({ iconCircle }, iconIndex) => (
            <Icon
              key={`VaultHeadlineIcon_${iconCircle}`}
              name={iconCircle}
              size="32px"
              sx={{
                verticalAlign: 'text-bottom',
                position: 'relative',
                zIndex: tokenData.length - iconIndex,
                mr: tokenData.length - 1 === iconIndex ? 2 : -16,
              }}
            />
          ))}
        {header}
        {followVaultEnabled && followButtonProps && (
          <FollowButtonControl
            followerAddress={followButtonProps.followerAddress}
            vaultId={followButtonProps.vaultId}
            chainId={followButtonProps.chainId}
          />
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
