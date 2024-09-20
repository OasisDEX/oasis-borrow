import { skyUsdsWalletStakeDetails } from 'blockchain/better-calls/sky'
import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'

export const skyPositionsHandler: PortfolioPositionsHandler = async ({ address }) => {
  return Promise.all([
    skyUsdsWalletStakeDetails({
      ownerAddress: address,
    }),
  ]).then(([usdsWalletStakeDetails]) => {
    return {
      address,
      positions: usdsWalletStakeDetails?.balance.isGreaterThan(0)
        ? [
            {
              availableToMigrate: false,
              automations: {},
              description: 'Sky Rewards Rate',
              details: [
                {
                  type: 'netValue',
                  value: `${formatCryptoBalance(usdsWalletStakeDetails.balance)} USDS`,
                },
                {
                  type: 'earnings',
                  value: `${formatCryptoBalance(usdsWalletStakeDetails.earned).toString()} SKY`,
                },
                {
                  type: 'apy',
                  value: formatPercent(usdsWalletStakeDetails.rewardRate).toString(),
                },
              ],
              lendingType: 'passive',
              network: NetworkNames.ethereumMainnet,
              netValue: usdsWalletStakeDetails.balance.toNumber(),
              positionId: address,
              primaryToken: 'USDS',
              protocol: LendingProtocol.Sky,
              secondaryToken: 'USDS',
              type: OmniProductType.Earn,
              url: `/earn/srr/${address}`,
            },
          ]
        : [],
    }
  })
}
