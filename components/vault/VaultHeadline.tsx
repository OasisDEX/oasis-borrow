import { Icon } from '@makerdao/dai-ui-icons'
import { Heading } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { getTokens } from 'blockchain/tokensMetadata'
import { FollowButtonControl } from 'features/follow/common/FollowButtonControl'
import { AppSpinner } from 'helpers/AppSpinner'
import React from 'react'
import { Flex } from 'theme-ui'

import { HeadlineDetailsProp, VaultHeadlineDetails } from './VaultHeadlineDetails'

export type VaultHeadlineProps = {
  header: string
  token: string[]
  details: HeadlineDetailsProp[]
  loading?: boolean
}

export function VaultHeadline({ header, token, details, loading = false }: VaultHeadlineProps) {
  const tokenData = getTokens(token)
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
        {/* test data example vault */}
        {/* 0x497cb171ddf49af82250d7723195d7e47ca38a95 433 version-11.07.2022 5 */}
        <FollowButtonControl
          followerAddress={'0x497CB171dDF49af82250D7723195D7E47Ca38A95'}
          vaultId={new BigNumber(433)}
          docVersion={'version-11.07.2022'}
          chainId={5}
        />
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
