import BigNumber from 'bignumber.js'
import type { AaveV3ReserveDataReply, AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { getAaveV3ReserveData } from 'blockchain/aave-v3'
import type { SparkV3ReserveDataReply, SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { getSparkV3ReserveData } from 'blockchain/spark-v3'
import { YEAR_DAYS } from 'components/constants'
import type { IStrategyConfig } from 'features/aave/types'
import type { AaveSimpleSupplyPosition } from 'features/omni-kit/protocols/aave-like/types/AaveSimpleSupply'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { aaveLikeAprToApyBN } from 'handlers/product-hub/helpers'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { useEffect, useMemo, useState } from 'react'

export function useAaveLikeSimpleEarnData({ strategy }: { strategy: IStrategyConfig }) {
  return function ({ networkId, tokenPriceUSDData }: OmniProtocolHookProps) {
    const [reserveData, setReserveData] = useState<
      AaveV3ReserveDataReply | SparkV3ReserveDataReply | undefined
    >(undefined)
    const aggregatedData = {
      auction: {},
      history: [],
    }
    useEffect(() => {
      // we only need one reserve data because theres no debt token (or they are the same)
      const loadAaveLikeReserveData = async () => {
        return strategy.protocol === LendingProtocol.AaveV3
          ? await getAaveV3ReserveData({
              token: strategy.tokens.collateral,
              networkId: networkId as AaveV3SupportedNetwork,
            })
          : await getSparkV3ReserveData({
              token: strategy.tokens.collateral,
              networkId: networkId as SparkV3SupportedNetwork,
            })
      }
      void loadAaveLikeReserveData().then(
        (data: AaveV3ReserveDataReply | SparkV3ReserveDataReply) => {
          setReserveData(data)
        },
      )
    }, [networkId])

    const positionData = useMemo(() => {
      // loading the needed position data (APYs, etc.)
      if (
        !tokenPriceUSDData?.[strategy.tokens.collateral] ||
        !tokenPriceUSDData[strategy.tokens.debt] ||
        !reserveData
      ) {
        return undefined
      }

      const per1d = aaveLikeAprToApyBN(reserveData.liquidityRate)
        .times(100)
        .div(new BigNumber(YEAR_DAYS))

      const position: AaveSimpleSupplyPosition = {
        apy: {
          per1d: per1d,
          per7d: per1d.times(7),
          per30d: per1d.times(30),
          per90d: per1d.times(90),
          per365d: per1d.times(YEAR_DAYS),
        },
        marketPrice: zero,
        owner: '',
        quoteTokenAmount: zero,
        close: () => ({} as unknown as AaveSimpleSupplyPosition),
        deposit: () => ({} as unknown as AaveSimpleSupplyPosition),
        withdraw: () => ({} as unknown as AaveSimpleSupplyPosition),
      }
      return position
    }, [reserveData, tokenPriceUSDData])

    return {
      data: {
        aggregatedData,
        positionData,
      },
      errors: [],
    }
  }
}
