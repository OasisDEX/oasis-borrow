import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { Skeleton } from 'components/Skeleton'
import { getAddress } from 'ethers/lib/utils'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableHeading } from 'features/discover/common/DiscoverTableHeading'
import {
  followTableSkippedHeaders,
  getMakerBorrowPositions,
  getMakerEarnPositions,
  getMakerMultiplyPositions,
  positionsTableTooltips,
} from 'features/vaultsOverview/helpers'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAddress } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useAccount } from 'helpers/useAccount'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Heading, Image, Text } from 'theme-ui'

export function FollowedList({ address }: { address: string }) {
  const { t } = useTranslation()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const { followedList$ } = useAppContext()
  const { walletAddress } = useAccount()
  const [followedListData, followedListError] = useObservable(followedList$(checksumAddress))

  const isOwner = address === walletAddress

  return (
    <WithErrorHandler error={[followedListError]}>
      <WithLoadingIndicator
        value={[followedListData]}
        customLoader={
          <DiscoverTableContainer padded>
            <Skeleton width="150px" lines={2} />
            <Skeleton height="175px" sx={{ mt: 4 }} />
          </DiscoverTableContainer>
        }
      >
        {([followedList]) => {
          const borrowPositions = getMakerBorrowPositions(followedList)
          const makerPositions = getMakerMultiplyPositions(followedList)
          const earnPositions = getMakerEarnPositions(followedList)

          return followedList.length ? (
            <DiscoverTableContainer title={`${t('following')} (${followedList.length})`}>
              {borrowPositions.length && (
                <>
                  <DiscoverTableHeading>
                    Oasis {t('nav.borrow')} ({borrowPositions.length})
                  </DiscoverTableHeading>
                  <DiscoverResponsiveTable
                    rows={borrowPositions}
                    skip={followTableSkippedHeaders}
                    tooltips={positionsTableTooltips}
                  />
                </>
              )}
              {makerPositions.length && (
                <>
                  <DiscoverTableHeading>
                    Oasis {t('nav.multiply')} ({makerPositions.length})
                  </DiscoverTableHeading>
                  <DiscoverResponsiveTable
                    rows={makerPositions}
                    skip={followTableSkippedHeaders}
                    tooltips={positionsTableTooltips}
                  />
                </>
              )}
              {earnPositions.length && (
                <>
                  <DiscoverTableHeading>
                    Oasis {t('nav.earn')} ({earnPositions.length})
                  </DiscoverTableHeading>
                  <DiscoverResponsiveTable
                    rows={earnPositions}
                    skip={followTableSkippedHeaders}
                    tooltips={positionsTableTooltips}
                  />
                </>
              )}
            </DiscoverTableContainer>
          ) : (
            <DiscoverTableContainer title={t('following')}>
              <Flex
                sx={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  my: '92px',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Image src={staticFilesRuntimeUrl('/static/img/no-positions.svg')} />
                <Heading variant="boldParagraph2" sx={{ mt: 4, mb: 1 }}>
                  {t(`vaults-overview.no-follow-header-${isOwner ? 'owner' : 'non-owner'}`, {
                    address: formatAddress(address),
                  })}
                </Heading>
                <Text as="p" variant="paragraph2" sx={{ m: 0, color: 'neutral80' }}>
                  <Trans
                    i18nKey="vaults-overview.no-follow-content"
                    components={[
                      <AppLink href="/discover" sx={{ fontWeight: 'regular', fontSize: 3 }} />,
                    ]}
                  />
                </Text>
              </Flex>
            </DiscoverTableContainer>
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
