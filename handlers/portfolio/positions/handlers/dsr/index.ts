import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds, NetworkNames } from 'blockchain/networks'
import { calculateDsrBalance, getYearlyRate } from 'features/dsr/helpers/dsrPot'
import { lazySummerFleets } from 'features/lazy-summer/consts'
import { getVaultsApy } from 'features/lazy-summer/server/get-vaults-apy'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { isZeroAddress } from 'helpers/isZeroAddress'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { DsProxyRegistry__factory, McdPot__factory } from 'types/ethers-contracts'

const PotFactory = McdPot__factory
const DsProxyFactory = DsProxyRegistry__factory

export const dsrPositionsHandler: PortfolioPositionsHandler = async ({
  address,
  prices,
  positionsCount,
}) => {
  const rpcProvider = getRpcProvider(NetworkIds.MAINNET)

  const DsProxyContractAddress = getNetworkContracts(NetworkIds.MAINNET).dsProxyRegistry.address
  const DsProxyContract = DsProxyFactory.connect(DsProxyContractAddress, rpcProvider)

  const [dsProxyAddress, vaultsApy] = await Promise.all([
    DsProxyContract.proxies(address),
    getVaultsApy({ fleets: lazySummerFleets }),
  ])

  if (dsProxyAddress && !isZeroAddress(dsProxyAddress)) {
    const daiPrice = prices['DAI']

    const PotContractAddress = getNetworkContracts(NetworkIds.MAINNET).mcdPot.address
    const PotContract = PotFactory.connect(PotContractAddress, rpcProvider)

    const [dsr, chi, pie] = await Promise.all([
      PotContract.dsr(),
      PotContract.chi(),
      PotContract.pie(dsProxyAddress),
    ])

    const netValue = calculateDsrBalance({
      chi: new BigNumber(chi.toString()),
      pie: new BigNumber(pie.toString()),
    })
    if (positionsCount && netValue.gt(zero)) {
      return {
        positions: [{ positionId: dsProxyAddress }],
      }
    }
    const apy = getYearlyRate(new BigNumber(dsr.toString()))
      .decimalPlaces(5, BigNumber.ROUND_UP)
      .minus(1)

    // Find the best APY from vaultsApy
    const bestApy = Object.values(vaultsApy).reduce((max, vault) => {
      return Math.max(max, vault.apy)
    }, 0)

    return {
      address,
      positions: netValue.gt(zero)
        ? [
            {
              availableToMigrate: false,
              automations: {},
              description: 'Dai Savings Rate',
              details: [
                {
                  type: 'netValue',
                  value: `${formatCryptoBalance(netValue)} DAI`,
                  rawValue: netValue.toNumber(),
                },
                {
                  type: 'earnings',
                  value: notAvailable,
                  rawValue: notAvailable,
                },
                {
                  type: 'apy',
                  value: formatDecimalAsPercent(apy),
                  rawValue: apy.toNumber(),
                },
              ],
              lendingType: 'passive',
              network: NetworkNames.ethereumMainnet,
              netValue: netValue.times(daiPrice).toNumber(),
              positionId: dsProxyAddress,
              primaryToken: 'DAI',
              protocol: LendingProtocol.Maker,
              secondaryToken: 'DAI',
              type: OmniProductType.Earn,
              url: `/earn/dsr/${address}`,
              lazySummerBestApy: {
                value: bestApy,
                link: `${EXTERNAL_LINKS.LAZY_SUMMER}/earn`,
              },
            },
          ]
        : [],
    }
  } else {
    return {
      address,
      positions: [],
    }
  }
}
