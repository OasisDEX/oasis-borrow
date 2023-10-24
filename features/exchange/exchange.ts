import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import type { ContractDesc } from 'features/web3Context'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, distinctUntilChanged, map, retry, switchMap, tap } from 'rxjs/operators'
import type { Dictionary } from 'ts-essentials'

import { amountFromWei, amountToWei } from '@oasisdex/utils/lib/src/utils'

const PROXY_API_ENDPOINT_SWAP = `/api/exchange/v4.0/1/swap`

interface Response {
  fromToken: TokenDescriptor
  toToken: TokenDescriptor
  toTokenAmount: string
  fromTokenAmount: string
  tx: Tx
}

interface TokenDescriptor {
  symbol: string
  name: string
  decimals: number
  eip2612?: boolean
  address: string
  logoURI: string
}

interface Tx {
  from: string
  to: string
  data: string
  value: string
  gasPrice: string
  gas: number
}

export type ExchangeAction = 'BUY_COLLATERAL' | 'SELL_COLLATERAL'

export type ExchangeType = 'defaultExchange' | 'noFeesExchange' | 'lowerFeesExchange'

type TokenMetadata = {
  address: string
  decimals: number
  name: string
  symbol: string
}

export type QuoteResult = {
  status: 'SUCCESS'
  fromTokenAddress: string
  toTokenAddress: string
  collateralAmount: BigNumber
  quoteAmount: BigNumber
  tokenPrice: BigNumber
  tx: Tx
}

export function getTokenMetaData(
  symbol: string,
  tokens: Dictionary<ContractDesc, string>,
): TokenMetadata {
  const details = getToken(symbol)
  return {
    address: tokens[symbol].address,
    decimals: details.precision,
    symbol,
    name: details.name,
  }
}

/**
 * Have to specify list and exclude Balancer
 * Because it causes re-entrancy issues
 * For Ajna multiply (and other Balancer FL using operations) on mainnet
 */
export const ETHEREUM_MAINNET_DEFAULT_PROTOCOLS = [
  'UNISWAP_V1',
  'UNISWAP_V2',
  'SUSHI',
  'MOONISWAP',
  /* Disabled see reentrancy issue */
  // 'BALANCER',
  'COMPOUND',
  'CURVE',
  'CURVE_V2_SPELL_2_ASSET',
  'CURVE_V2_SGT_2_ASSET',
  'CURVE_V2_THRESHOLDNETWORK_2_ASSET',
  'CHAI',
  'OASIS',
  'KYBER',
  'AAVE',
  'IEARN',
  'BANCOR',
  'SWERVE',
  'BLACKHOLESWAP',
  'DODO',
  'DODO_V2',
  'VALUELIQUID',
  'SHELL',
  'DEFISWAP',
  'SAKESWAP',
  'LUASWAP',
  'MINISWAP',
  'MSTABLE',
  'PMM2',
  'SYNTHETIX',
  'AAVE_V2',
  'ST_ETH',
  'ONE_INCH_LP',
  'ONE_INCH_LP_1_1',
  'LINKSWAP',
  'S_FINANCE',
  'PSM',
  'POWERINDEX',
  'XSIGMA',
  'SMOOTHY_FINANCE',
  'SADDLE',
  'KYBER_DMM',
  /* Disabled see reentrancy issue */
  // 'BALANCER_V2',
  'UNISWAP_V3',
  'SETH_WRAPPER',
  'CURVE_V2',
  'CURVE_V2_EURS_2_ASSET',
  'CURVE_V2_ETH_CRV',
  'CURVE_V2_ETH_CVX',
  'CONVERGENCE_X',
  /* Disbled becuase wrong token price */
  //'ONE_INCH_LIMIT_ORDER',
  //'ONE_INCH_LIMIT_ORDER_V2',
  //'ONE_INCH_LIMIT_ORDER_V3',
  'DFX_FINANCE',
  'FIXED_FEE_SWAP',
  'DXSWAP',
  'SHIBASWAP',
  'UNIFI',
  'PSM_PAX',
  'WSTETH',
  'DEFI_PLAZA',
  'FIXED_FEE_SWAP_V3',
  'SYNTHETIX_WRAPPER',
  'SYNAPSE',
  'CURVE_V2_YFI_2_ASSET',
  'CURVE_V2_ETH_PAL',
  'POOLTOGETHER',
  'ETH_BANCOR_V3',
  'ELASTICSWAP',
  /* Disabled see reentrancy issue */
  // 'BALANCER_V2_WRAPPER',
  'FRAXSWAP',
  'RADIOSHACK',
  'KYBERSWAP_ELASTIC',
  'CURVE_V2_TWO_CRYPTO',
  'STABLE_PLAZA',
  'ZEROX_LIMIT_ORDER',
  'CURVE_3CRV',
  'KYBER_DMM_STATIC',
  'ANGLE',
  'ROCKET_POOL',
  'ETHEREUM_ELK',
  'ETHEREUM_PANCAKESWAP_V2',
  'SYNTHETIX_ATOMIC_SIP288',
  'PSM_GUSD',
  'INTEGRAL',
  'MAINNET_SOLIDLY',
  'NOMISWAP_STABLE',
  'CURVE_V2_TWOCRYPTO_META',
  'MAVERICK_V1',
  'VERSE',
  'DFX_FINANCE_V2',
  'ZK_BOB',
  'PANCAKESWAP_V3',
  'NOMISWAPEPCS',
  'XFAI',
  'CURVE_V2_LLAMMA',
  'CURVE_V2_TRICRYPTO_NG',
  'PMM8_2',
  'SUSHISWAP_V3',
  'SFRX_ETH',
  'SDAI',
]

export const OPTIMISM_DEFAULT_PROCOTOLS = [
  'OPTIMISM_UNISWAP_V3',
  'OPTIMISM_SYNTHETIX',
  'OPTIMISM_SYNTHETIX_WRAPPER',
  'OPTIMISM_ONE_INCH_LIMIT_ORDER',
  'OPTIMISM_ONE_INCH_LIMIT_ORDER_V2',
  'OPTIMISM_ONE_INCH_LIMIT_ORDER_V3',
  'OPTIMISM_CURVE',
  // 'OPTIMISM_BALANCER_V2', - We can't use balancer due to reentrancy issues
  'OPTIMISM_VELODROME',
  'OPTIMISM_KYBERSWAP_ELASTIC',
  'OPTIMISM_CLIPPER_COVES',
  'OPTIMISM_KYBER_DMM_STATIC',
  'OPTIMISM_AAVE_V3',
  'OPTIMISM_ELK',
  'OPTIMISM_WOOFI_V2',
  'OPTIMISM_TRIDENT',
  'OPTIMISM_MUMMY_FINANCE',
]

export const ARBITRUM_DEFAULT_LIQUIDITY_PROVIDERS = [
  // 'ARBITRUM_BALANCER_V2', - We can't use balancer due to reentrancy issues
  'ARBITRUM_ONE_INCH_LIMIT_ORDER',
  'ARBITRUM_ONE_INCH_LIMIT_ORDER_V2',
  'ARBITRUM_ONE_INCH_LIMIT_ORDER_V3',
  'ARBITRUM_DODO',
  'ARBITRUM_DODO_V2',
  'ARBITRUM_SUSHISWAP',
  'ARBITRUM_DXSWAP',
  'ARBITRUM_UNISWAP_V3',
  'ARBITRUM_CURVE',
  'ARBITRUM_CURVE_V2',
  'ARBITRUM_GMX',
  'ARBITRUM_SYNAPSE',
  'ARBITRUM_PMM5',
  'ARBITRUM_SADDLE',
  'ARBITRUM_KYBERSWAP_ELASTIC',
  'ARBITRUM_KYBER_DMM_STATIC',
  'ARBITRUM_AAVE_V3',
  'ARBITRUM_ELK',
  'ARBITRUM_WOOFI_V2',
  'ARBITRUM_CAMELOT',
  'ARBITRUM_TRADERJOE',
  'ARBITRUM_TRADERJOE_V2',
  'ARBITRUM_SWAPFISH',
  'ARBITRUM_ZYBER',
  'ARBITRUM_ZYBER_STABLE',
  'ARBITRUM_SOLIDLIZARD',
  'ARBITRUM_ZYBER_V3',
  'ARBITRUM_MYCELIUM',
  'ARBITRUM_TRIDENT',
  'ARBITRUM_SHELL_OCEAN',
  'ARBITRUM_RAMSES',
  'ARBITRUM_TRADERJOE_V2_1',
  'ARBITRUM_NOMISWAPEPCS',
  'ARBITRUM_CAMELOT_V3',
  'ARBITRUM_WOMBATSWAP',
  'ARBITRUM_CHRONOS',
  'ARBITRUM_LIGHTER',
  'ARBITRUM_ARBIDEX',
  'ARBITRUM_ARBIDEX_V3',
  'ARBSWAP',
  'ARBSWAP_STABLE',
  'ARBITRUM_SUSHISWAP_V3',
  'ARBITRUM_RAMSES_V2',
  'ARBITRUM_LEVEL_FINANCE',
  'ARBITRUM_CHRONOS_V3',
]

export const BASE_DEFAULT_LIQUIDITY_PROVIDERS = [
  'BASE_MAVERICK',
  'BASE_ONE_INCH_LIMIT_ORDER_V3',
  'BASE_UNISWAP_V3',
  // "BASE_BALANCER_V2",
  'BASE_SUSHI_V3',
  'BASE_SWAP',
  'BASE_KOKONUT_SWAP',
  'BASE_ROCKET_SWAP',
  'BASE_SWAP_BASED',
  'BASE_SYNTHSWAP',
  'BASE_HORIZON_DEX',
  'BASE_VELOCIMETER_V2',
  'BASE_DACKIE_SWAP',
  'BASE_ALIEN_BASE',
  // DISABLE ONLY FOR TENDERLY TESING
  // "BASE_WOOFI_V2",
  'BASE_ZYBER_V3',
  'BASE_PANCAKESWAP_V2',
  'BASE_PANCAKESWAP_V3',
  'BASE_AERODROME',
  'BASE_BASESWAP_V3',
  'BASE_CURVE',
  'BASE_CURVE_V2_TRICRYPTO_NG',
  'BASE_CURVE_V2_TWO_CRYPTO',
  'BASE_SMARDEX',
]

export function getQuote$(
  quote: TokenMetadata,
  collateral: TokenMetadata,
  account: string,
  amount: BigNumber, // This is always the receiveAtLeast amount of tokens we want to exchange from
  slippage: BigNumber,
  action: ExchangeAction,
  protocols?: string,
) {
  const fromTokenAddress = action === 'BUY_COLLATERAL' ? quote.address : collateral.address
  const toTokenAddress = action === 'BUY_COLLATERAL' ? collateral.address : quote.address

  const _1inchAmount = amountToWei(
    amount,
    action === 'BUY_COLLATERAL' ? quote.decimals : collateral.decimals,
  ).toFixed(0)

  //TODO: set proper precision depending on token
  const searchParams = new URLSearchParams({
    fromTokenAddress,
    toTokenAddress,
    amount: _1inchAmount,
    fromAddress: account,
    slippage: slippage.times(100).toString(),
    disableEstimate: 'true',
    allowPartialFill: 'false',
    protocols: protocols || ETHEREUM_MAINNET_DEFAULT_PROTOCOLS.join(','),
  })

  const responseBase = {
    status: 'SUCCESS',
    fromTokenAddress,
    toTokenAddress,
  }

  if (amount.isZero() || amount.isNaN() || !amount.isFinite() || _1inchAmount === '0') {
    //this is not valid 1inch call

    return of({
      ...responseBase,

      collateralAmount: amountFromWei(new BigNumber(0)),
      quoteAmount: amountFromWei(new BigNumber(0)),
      tokenPrice: new BigNumber(0),
      tx: {
        //empty payload
        data: '',
        from: '',
        gas: 0,
        gasPrice: '0',
        to: '',
        value: '0',
      },
    } as QuoteResult)
  }

  return ajax(`${PROXY_API_ENDPOINT_SWAP}?${searchParams.toString()}`).pipe(
    tap((response) => {
      if (response.status !== 200) throw new Error(response.responseText)
    }),
    map((response): Response => response.response),
    map(({ fromToken, toToken, toTokenAmount, fromTokenAmount, tx }) => {
      const normalizedFromTokenAmount = amountFromWei(
        new BigNumber(fromTokenAmount),
        fromToken.decimals,
      )
      const normalizedToTokenAmount = amountFromWei(new BigNumber(toTokenAmount), toToken.decimals)

      return {
        ...responseBase,
        collateralAmount: amountFromWei(
          action === 'BUY_COLLATERAL'
            ? new BigNumber(toTokenAmount)
            : new BigNumber(fromTokenAmount),
          action === 'BUY_COLLATERAL' ? toToken.decimals : fromToken.decimals,
        ),
        quoteAmount: amountFromWei(
          action === 'BUY_COLLATERAL'
            ? new BigNumber(fromTokenAmount)
            : new BigNumber(toTokenAmount),
          action === 'BUY_COLLATERAL' ? fromToken.decimals : toToken.decimals,
        ),
        tokenPrice:
          action === 'BUY_COLLATERAL'
            ? normalizedFromTokenAmount.div(normalizedToTokenAmount)
            : normalizedToTokenAmount.div(normalizedFromTokenAmount),
        tx,
      }
    }),
    retry(3),
    catchError(() => of({ status: 'ERROR' } as const)),
  )
}

export type Quote = ReturnType<typeof getQuote$> extends Observable<infer R> ? R : never

export function createExchangeQuote$(
  context$: Observable<Context>,
  protocols: string | undefined,
  token: string,
  slippage: BigNumber,
  amount: BigNumber,
  action: ExchangeAction,
  exchangeType: ExchangeType,
  quoteToken?: string,
) {
  return context$.pipe(
    switchMap((context) => {
      const contracts = getNetworkContracts(NetworkIds.MAINNET, context.chainId)
      const tokensMainnet = contracts.tokensMainnet
      const exchange = contracts[exchangeType]

      const quote = getTokenMetaData(quoteToken || 'DAI', tokensMainnet)
      const collateral = getTokenMetaData(token, tokensMainnet)

      return getQuote$(quote, collateral, exchange.address, amount, slippage, action, protocols)
    }),
    distinctUntilChanged((s1, s2) => {
      return JSON.stringify(s1) === JSON.stringify(s2)
    }),
  )
}
