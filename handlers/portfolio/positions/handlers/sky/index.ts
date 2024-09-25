import BigNumber from 'bignumber.js'
import { skyUsdsStakeDetails, skyUsdsWalletStakeDetails } from 'blockchain/better-calls/sky'
import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'

export const skyPositionsHandler: PortfolioPositionsHandler = async ({ address, prices }) => {
  return Promise.all([
    skyUsdsWalletStakeDetails({
      ownerAddress: address,
    }),
    skyUsdsStakeDetails({ mkrPrice: new BigNumber(prices.MKR) }),
  ]).then(([usdsWalletStakeDetails, usdsStakeDetails]) => {
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
                  value: formatDecimalAsPercent(usdsStakeDetails.apy),
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
