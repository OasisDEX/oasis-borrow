import BigNumber from 'bignumber.js'
import {
  skyUsdsStakeDetails,
  skyUsdsWalletStakeCleDetails,
  skyUsdsWalletStakeDetails,
} from 'blockchain/better-calls/sky'
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
    skyUsdsWalletStakeCleDetails({ ownerAddress: address, isServer: true }),
  ]).then(([usdsWalletStakeDetails, usdsStakeDetails, usdsWalletStakeCleDetails]) => {
    const positions = []
    if (usdsWalletStakeDetails?.balance.isGreaterThan(0)) {
      positions.push({
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
      })
    }
    if (usdsWalletStakeCleDetails?.balance.isGreaterThan(0)) {
      positions.push({
        availableToMigrate: false,
        automations: {},
        description: 'Chronicle Points',
        details: [
          {
            type: 'netValue',
            value: `${formatCryptoBalance(usdsWalletStakeCleDetails.balance)} USDS`,
          },
          {
            type: 'earnings',
            value: `${formatCryptoBalance(usdsWalletStakeCleDetails.earned).toString()} CLE`,
          },
        ],
        lendingType: 'passive',
        network: NetworkNames.ethereumMainnet,
        netValue: usdsWalletStakeCleDetails.balance.toNumber(),
        positionId: address,
        primaryToken: 'USDS',
        protocol: LendingProtocol.Sky,
        secondaryToken: 'USDS',
        type: OmniProductType.Earn,
        url: `/earn/cle/${address}`,
      })
    }
    return {
      address,
      positions,
    }
  })
}
