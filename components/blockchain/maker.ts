import { Currency } from '../currency/currency'

interface AbstractToken<I extends string, U extends number> {
  iso: I
  unit: U
  currency: Currency<U, I>
}

interface AbstractIlk<I extends string, T extends AbstractToken<any, any>> {
  ilk: I
  token: T
}

type ETH = AbstractToken<'ETH', 18>
type DAI = AbstractToken<'DAI', 18>
type WBTC = AbstractToken<'WBTC', 18>

export type Ilks =
  | AbstractIlk<'ETH-A', ETH>
  | AbstractIlk<'ETH-B', ETH>
  | AbstractIlk<'WBTC-A', WBTC>

export type Token = Ilks['token'] | DAI

export type ISO = Ilks['token']['iso']

export type Ilk = Ilks['ilk']

export type TokenFromIlk<I extends Ilk> = Extract<Ilks, AbstractIlk<I, any>>['token']

export type TokenByISO<I extends ISO> = Extract<Token, AbstractToken<I, any>>

export type Collateral<I extends Ilk> = TokenFromIlk<I>['currency']
