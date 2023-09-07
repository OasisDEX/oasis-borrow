import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { ContractDesc } from 'features/web3Context'
import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, distinctUntilChanged, map, retry, switchMap, tap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

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

export const OPTIMIMS_DEFAULT_PROCOTOLS = [
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
