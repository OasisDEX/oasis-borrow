import BigNumber from 'bignumber.js'
import type { AaveV2ReserveDataReply } from 'blockchain/aave'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedAaveTotalValueLocked = {
  totalValueLocked: BigNumber
}

type PrepareAaveTVLProps = [AaveV2ReserveDataReply, AaveV2ReserveDataReply, BigNumber[]]

export function prepareAaveTotalValueLocked$(
  getAaveStEthReserveData$: Observable<AaveLikeReserveData>,
  getAaveWEthReserveData$: Observable<AaveLikeReserveData>,
  getAaveLikeAssetsPrices$: Observable<BigNumber[]>,
): Observable<PreparedAaveTotalValueLocked> {
  return combineLatest(
    getAaveStEthReserveData$,
    getAaveWEthReserveData$,
    getAaveLikeAssetsPrices$,
  ).pipe(
    map(
      ([
        STETH_reserveData,
        ETH_reserveData,
        [USDC_ETH_price, STETH_ETH_ratio],
      ]: PrepareAaveTVLProps) => {
        /*
          The formula:
          Steth_availableLiquidity* steth/usd -((weth_totalStableDebt + weth_totalVariableDebt)* eth/usd ) = total value locked

          Since AAVE doesn't provide the total value locked, we need to calculate it ourselves.
          We need to get the total value locked in USD, so we need to convert the ETH and STETH values to USD.
          There's no prices in USD in their oracle so im assuming 1 USDC = 1 USD
        */
        const ETH_USDC_price = new BigNumber(1).div(USDC_ETH_price) // price of one ETH in USDC
        const STETH_USDC_price = STETH_ETH_ratio.times(ETH_USDC_price) // price of one STETH in USDC

        const STETH_availableLiquidity = new BigNumber(STETH_reserveData.availableLiquidity) // available liquidity in STETH
        const WETH_totalStableDebt = new BigNumber(ETH_reserveData.totalStableDebt) // total stable debt in WETH
        const WETH_totalVariableDebt = new BigNumber(ETH_reserveData.totalVariableDebt) // total variable debt in WETH

        const STETH_USDC_availableLiquidity = STETH_availableLiquidity.times(STETH_USDC_price) // available liquidity in STETH in USDC
        const USDC_WETH_debt =
          WETH_totalStableDebt.plus(WETH_totalVariableDebt).times(ETH_USDC_price) // total debt in WETH in USDC
        const totalValueLocked = STETH_USDC_availableLiquidity.minus(USDC_WETH_debt) // total value locked in USDC

        return {
          totalValueLocked,
        }
      },
    ),
  )
}
