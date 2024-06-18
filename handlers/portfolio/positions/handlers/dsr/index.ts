import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds, NetworkNames } from 'blockchain/networks'
import { calculateDsrBalance, getYearlyRate } from 'features/dsr/helpers/dsrPot'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { isZeroAddress } from 'helpers/isZeroAddress'
import { getPointsPerYear } from 'helpers/rays'
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

  const dsProxyAddress = await DsProxyContract.proxies(address)

  if (dsProxyAddress && !isZeroAddress(dsProxyAddress)) {
    const daiPrice = prices['DAI']

    const PotContractAddress = getNetworkContracts(NetworkIds.MAINNET).mcdPot.address
    const PotContract = PotFactory.connect(PotContractAddress, rpcProvider)

    const dsr = await PotContract.dsr()
    const chi = await PotContract.chi()
    const pie = await PotContract.pie(dsProxyAddress)

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

    const raysPerYear = getPointsPerYear(netValue.toNumber())

    return {
      address,
      positions: netValue.gt(zero)
        ? [
            {
              raysPerYear,
              availableToMigrate: false,
              automations: {},
              description: 'Dai Savings Rate',
              details: [
                {
                  type: 'netValue',
                  value: `${formatCryptoBalance(netValue)} DAI`,
                },
                {
                  type: 'earnings',
                  value: notAvailable,
                },
                {
                  type: 'apy',
                  value: formatDecimalAsPercent(apy),
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
              url: `/earn/dsr/`,
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
