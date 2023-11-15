import { Announcement } from 'components/Announcement'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { getAddress } from 'ethers/lib/utils'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import { AssetsAndPositionsOverview } from 'features/vaultsOverview/containers/AssetsAndPositionsOverview'
import { ConnectWalletPrompt } from 'features/vaultsOverview/containers/ConnectWalletPrompt'
import { PositionsTable } from 'features/vaultsOverview/containers/PositionsTable'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { getPortfolioLink } from 'helpers/get-portfolio-link'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { bannerWallet } from 'theme/icons'
import { Flex, Grid, Text } from 'theme-ui'

import { VaultOwnershipNotice } from './containers/VaultOwnershipNotice'
import { useOwnerPositions } from './owner-positions'

export function VaultsOverviewView({ address }: { address: string }) {
  const { AjnaSafetySwitch: ajnaSafetySwitchOn, NewPortfolio: newPortfolioEnabled } =
    useAppConfig('features')

  const { t } = useTranslation()
  // calculating positions
  const mainContext = useMainContext()
  const accountContext = useAccountContext()
  const { positionsList$ } = useOwnerPositions(mainContext, accountContext)

  const checksumAddress = getAddress(address.toLocaleLowerCase())

  const memoizedPositionList$ = useMemo(() => positionsList$(checksumAddress), [checksumAddress])

  const [positionsListData, positionsListError] = useObservable(memoizedPositionList$)

  const { walletAddress } = useAccount()
  const isOwner = address === walletAddress

  return (
    <Grid sx={{ flex: 1, zIndex: 1, gap: '48px', mt: [0, 4], mb: 5 }} key={address}>
      {newPortfolioEnabled && (
        <VaultNotice
          status={
            <Flex
              sx={{
                border: 'bold',
                borderRadius: 'circle',
                width: '56px',
                height: '56px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size="auto" width="24" height="24" icon={bannerWallet} />
            </Flex>
          }
          header={t('vaults-overview.portfolio-banner-header')}
          subheader={
            <Text>
              {t('vaults-overview.portfolio-banner-content')}{' '}
              <AppLink href={getPortfolioLink(address)} sx={{ fontSize: 3 }}>
                {t('here')}
              </AppLink>
            </Text>
          }
          color="primary100"
          withClose={false}
        />
      )}
      {ajnaSafetySwitchOn &&
        isOwner &&
        positionsListData?.ajnaPositions &&
        positionsListData.ajnaPositions.length > 0 && (
          <Announcement
            text="There has been possible griefing attack vector identified on Ajna Protocol. All Ajna users should close their positions and withdraw their funds. This is not related to any summer.fi contracts, so Maker and Aave users are not affected."
            discordLink={EXTERNAL_LINKS.DISCORD}
            link="https://blog.summer.fi/ajna-possible-attack-vector/"
            linkText="Read more"
            withClose={false}
          />
        )}
      <VaultOwnershipNotice address={address} />
      <AssetsAndPositionsOverview address={address} />
      <PositionsTable
        address={address}
        ownersPositionsListData={positionsListData}
        ownersPositionsListError={positionsListError}
      />
      <ConnectWalletPrompt />
    </Grid>
  )
}
