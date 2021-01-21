import { Currency } from "components/currency/currency"

type ETH = TokenInfo<'ETH', 18>
type DAI = TokenInfo<'DAI', 18>
type WBTC = TokenInfo<'WBTC', 18>
type Ilks = 
  | IlkInfo<'ETH-A', ETH>
  | IlkInfo<'ETH-B', ETH>
  | IlkInfo<'WBTC-A', WBTC>
  | IlkInfo<"Damian", ETH>

interface IlkInfo<I extends string, C extends TokenInfo<any,any>> {
  type: I,
  tokenInfo: C
}
interface TokenInfo<I extends string, U extends number> {
    iso: I
    unit: U
    currency: Currency<U, I>
  }

type Token =  
  | Ilks['tokenInfo']
  | DAI

export type Ilk = Ilks['type']

type TokenByISO<I extends string> = Extract<Token, TokenInfo<I, any>>

type TokenInfoFromIlk<I extends Ilk> = Extract<Ilks, IlkInfo<I, any>>['tokenInfo']
type Test = TokenInfoFromIlk<'Damian'>

type CollateralFromIlk<I extends Ilk> = TokenInfoFromIlk<I>['currency']

