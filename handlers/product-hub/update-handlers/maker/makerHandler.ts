// import { OmniProductType } from 'features/productHub/types'

import { RiskRatio } from '@oasisdex/dma-library'
import { amountFromWei } from '@oasisdex/utils'
import { AutomationFeature } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds, networksById } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { amountFromRad, amountFromRay } from 'blockchain/utils'
import { RAY, SECONDS_PER_YEAR } from 'components/constants'
import type { BigNumberish } from 'ethers'
import { getYearlyRate } from 'features/dsr/helpers/dsrPot'
import type { ProductHubItem, ProductHubSupportedNetworks } from 'features/productHub/types'
import type {
  ProductHubHandlerResponse,
  ProductHubHandlerResponseData,
} from 'handlers/product-hub/types'
import { one, zero } from 'helpers/zero'
import {
  McdJug__factory,
  McdPot__factory,
  McdSpot__factory,
  Vat__factory,
} from 'types/ethers-contracts'
import Web3 from 'web3'

import { makerProductHubProducts } from './makerProducts'

const VatFactory = Vat__factory
const JugFactory = McdJug__factory
const SpotFactory = McdSpot__factory
const PotFactory = McdPot__factory

// types/ethers-contracts uses ethers.BigNumber, but we need bignumber.js
const bigNumberify = (val: BigNumberish) => new BigNumber(val.toString())

const getIlk = (label: string) => (['DSR'].includes(label) ? label : label.split('/')[0])

async function getMakerData(
  networkId: NetworkIds.MAINNET,
  tickers: Tickers,
): ProductHubHandlerResponse {
  const rpcProvider = getRpcProvider(networkId)
  const VatContractAddress = getNetworkContracts(networkId).vat.address
  const VatContract = VatFactory.connect(VatContractAddress, rpcProvider)
  const JugContractAddress = getNetworkContracts(networkId).mcdJug.address
  const JugContract = JugFactory.connect(JugContractAddress, rpcProvider)
  const SpotContractAddress = getNetworkContracts(networkId).mcdSpot.address
  const SpotContract = SpotFactory.connect(SpotContractAddress, rpcProvider)
  const PotContractAddress = getNetworkContracts(networkId).mcdPot.address
  const PotContract = PotFactory.connect(PotContractAddress, rpcProvider)
  const daiPrice = new BigNumber(getTokenPrice('DAI', tickers, 'makerHandler'))

  const ilksListWithHexValues = makerProductHubProducts.reduce(
    (acc, product) => {
      const ilk = getIlk(product.label)
      return {
        ...acc,
        [ilk]: Web3.utils.padRight(Web3.utils.stringToHex(ilk), 64),
      }
    },
    {} as { [key: string]: string },
  )

  const vatIlkPromises = Object.keys(ilksListWithHexValues).map(async (ilk) => {
    const vatIlkData = await VatContract.ilks(ilksListWithHexValues[ilk])
    return {
      [ilk]: {
        liquidityAvailable: BigNumber.max(
          amountFromRad(bigNumberify(vatIlkData.line))
            .minus(
              amountFromRay(bigNumberify(vatIlkData.rate)).times(
                amountFromWei(bigNumberify(vatIlkData.Art)),
              ),
            )
            .decimalPlaces(18, BigNumber.ROUND_DOWN),
          zero,
        ),
      },
    }
  })

  const jugIlkPromises = Object.keys(ilksListWithHexValues).map(async (ilk) => {
    const jugIlkData = await JugContract.ilks(ilksListWithHexValues[ilk])
    const fee = new BigNumber(bigNumberify(jugIlkData[0])).dividedBy(RAY)
    BigNumber.config({ POW_PRECISION: 100 })
    const stabilityFee = fee.pow(SECONDS_PER_YEAR).minus(1)
    return {
      [ilk]: {
        fee: stabilityFee,
      },
    }
  })

  const spotIlkPromises = Object.keys(ilksListWithHexValues).map(async (ilk) => {
    const spotIlkData = await SpotContract.ilks(ilksListWithHexValues[ilk])
    const maxMultiple = one.plus(one.div(amountFromRay(bigNumberify(spotIlkData.mat)).minus(one)))
    return {
      [ilk]: {
        maxMultiple,
        maxLtv: new RiskRatio(maxMultiple, RiskRatio.TYPE.MULITPLE).loanToValue,
      },
    }
  })

  const dsrPromise = PotContract.dsr()

  return Promise.all([
    Promise.all(vatIlkPromises),
    Promise.all(jugIlkPromises),
    Promise.all(spotIlkPromises),
    dsrPromise,
  ]).then(([vatIlkData, jugIlkData, spotIlkData, dsrData]) => {
    return {
      table: makerProductHubProducts
        .map((product) => {
          const { secondaryToken, primaryToken, label } = product
          const tokensAddresses = getNetworkContracts(networkId).tokens
          const primaryTokenAddress = tokensAddresses[primaryToken].address
          const secondaryTokenAddress = tokensAddresses[secondaryToken].address

          if (label === 'DSR') {
            return {
              ...product,
              primaryTokenAddress,
              secondaryTokenAddress,
              network: networksById[networkId].name as ProductHubSupportedNetworks,
              weeklyNetApy: getYearlyRate(bigNumberify(dsrData) || zero)
                .decimalPlaces(5, BigNumber.ROUND_UP)
                .minus(1)
                .toString(),
              hasRewards: false,
            }
          }
          const ilk = getIlk(label)
          const { liquidityAvailable } = vatIlkData.find((data) => data[ilk])![ilk]
          const { fee } = jugIlkData.find((data) => data[ilk])![ilk]
          const { maxMultiple, maxLtv } = spotIlkData.find((data) => data[ilk])![ilk]
          const liquidity = liquidityAvailable.times(daiPrice)

          return {
            ...product,
            primaryTokenAddress,
            secondaryTokenAddress,
            network: networksById[networkId].name as ProductHubSupportedNetworks,
            liquidity: liquidity.toString(),
            fee: fee.toString(),
            maxMultiply: maxMultiple.toString(),
            maxLtv: maxLtv.toString(),
            hasRewards: false,
            automationFeatures: [
              AutomationFeature.stopLoss,
              AutomationFeature.autoBuy,
              AutomationFeature.autoSell,
              AutomationFeature.takeProfit,
              AutomationFeature.constantMultiple,
            ],
          }
        })
        .filter(Boolean) as ProductHubItem[],
      warnings: [],
    }
  })
}

export default async function (tickers: Tickers): ProductHubHandlerResponse {
  return Promise.all([getMakerData(NetworkIds.MAINNET, tickers)]).then((responses) => {
    return responses.reduce<ProductHubHandlerResponseData>(
      (v, response) => {
        return {
          table: [...v.table, ...response.table],
          warnings: [...v.warnings, ...response.warnings],
        }
      },
      { table: [], warnings: [] },
    )
  })
}
