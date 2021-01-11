import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { flatMap, last, mergeMap, shareReplay, switchMap, take, tap } from 'rxjs/operators'

import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { ContextConnected } from '../../components/blockchain/network'

// export interface Vault {
//   id: string
//   type: string // ilk
//   owner: string //proxyAddress
//   address: string // urnHandler
//   proxyOwner: string //
//   encumberedCollateral: BigNumber // ink
//   encumberedDebt: BigNumber // art
//   collateralTypePrice: BigNumber
//   debtValue: BigNumber
//   collateralAmount: BigNumber
//   collateralValue: BigNumber
//   liquidationPrice: BigNumber
//   daiAvailable: BigNumber
//   collateralAvailableAmount: BigNumber
//   collateralAvailableValue: BigNumber
//   unlockedCollateral: BigNumber
//   collateralizationRatio: BigNumber
//   liquidationRatio: BigNumber
//   liquidationPenalty: BigNumber
//   annualStabilityFee: BigNumber
//   debtFloor: BigNumber
//   minSafeCollateralAmount: BigNumber
//   collateralDebtAvailable: BigNumber
// }

export interface Vault {
  /*
   * The vault "id" is recorded in a list in the cdpManager contract.
   * On creation (open) of a vault using the cdpManager contract, two
   * actions occur:
   *
   * 1) a new id is generated from the cdpManager.cdpi variable, a counter
   * variable which increments on each creation of a vault.
   * 2) an UrnHandler contract is created which is a used as a memory location
   * for the Urn struct in the Vat contract.
   *
   * After these two actions, three mappings are instantiated:
   * - urns :: id => urnHandler
   * - owns :: id => address
   * - ilks :: id => ilk
   *
   */
  id: string

  /*
   * As mentioned in Vault.id, the "owner" is found in the cdpManager.owns
   * mapping. It requires just an address but for the majority of cases will
   * be an address for a proxy contract created by an oasis borrow user.
   *
   * The owner here is the controller of the vault through the cdpManager
   */
  owner: string

  /*
   * The "proxyOwner" is found in a deployed instance of a DSProxy contract.
   * Assuming again the majority of cases, the oasis borrow's user address
   * should match the address found by calling DSProxy.owner at address
   * Vault.owner.
   */
  proxyOwner: string // address of owner of proxy

  /*
   * A vault "token" is referred to as a "gem" in the core contracts. The gems
   * are the series of tokens which are valid collateral tokens.
   */
  token: string

  /*
   * The vault "type" is referred to as an Ilk in the core contracts. We can
   * name it more generally as a "collateral type" as each has it's own set
   * of parameters or characteristics, e.g
   * - ETH-A, gem is ETH, Stability Fee is 2.5%, ...
   * - ETH-B, gem is ETH, Stability Fee is 5% ...
   * - WBTC-A, gem is WBTC, Stability Fee is 4.5% ...
   */
  type: string

  /*
   * The vault "address" is as mentioned in Vault.id, an address in memory
   * for the Urn struct contained in the Vat contract. The struct contains
   * two variables, the ink and the art.
   */
  address: string // urnHandler address

  /*
   * The vault "collateral" is called the "ink" in the core contracts.
   * It records to the (wad) amount of collateral tokens (gems) "locked" in
   * the Vat.
   *
   * Note: There is a bit of ambiguity in terms of the amount of what is
   * "locked" which is defined by how we deposit collateral tokens into the
   * protocol. It's a two step process where the user must first deposit their
   * tokens using the relevant join adapter. A second step is then required
   * that the user must frob
   */
  collateral: BigNumber

  normalizedDebt: BigNumber // urn.art - Dai created / rate
  tokenPrice: BigNumber // price in USD of 1 unit of gem
  liquidationPrice: BigNumber
  debtValue: BigNumber
  collateralValue: BigNumber
  daiAvailable: BigNumber
  collateralAvailable: BigNumber
  collateralAvailableValue: BigNumber
  unlockedCollateral: BigNumber
  collateralizationRatio: BigNumber
  liquidationRatio: BigNumber
  liquidationPenalty: BigNumber
  annualStabilityFee: BigNumber
  debtFloor: BigNumber
  minSafeCollateralAmount: BigNumber
  collateralDebtAvailable: BigNumber
}

export const mockVault: Vault = {
  id: '500',
  type: 'ETH-A',
  owner: '0x05623eb676A8abA2d381604B630ded1A81Dc05a9',
  address: '0x882cd8B63b4b6cB5ca2Bda899f6A8c968d66643e',
  proxyOwner: '0x8A0Bfe04D175D345b5FDcD3e9Ca5d00b608Ce6A3',
  encumberedCollateral: new BigNumber('98'),
  encumberedDebt: new BigNumber('16403.419856003889170145'),
  annualStabilityFee: new BigNumber(
    '0.024999999999905956943812259791573533789860268487320672821177905084121745214484109204754426155886843',
  ),
  collateralAmount: new BigNumber('98.00'),
  collateralAvailableAmount: new BigNumber('77.72'),
  collateralAvailableValue: new BigNumber('96770.74'),
  collateralDebtAvailable: new BigNumber('110593468.87'),
  collateralTypePrice: new BigNumber('1245.05'),
  collateralValue: new BigNumber('122014.90'),
  collateralizationRatio: new BigNumber('7.25'),
  daiAvailable: new BigNumber('64513.82'),
  debtFloor: new BigNumber('500'),
  debtValue: new BigNumber('16829.44'),
  liquidationPenalty: new BigNumber('0.13'),
  liquidationPrice: new BigNumber('257.59'),
  liquidationRatio: new BigNumber('1.50'),
  minSafeCollateralAmount: new BigNumber('20.28'),
  unlockedCollateral: new BigNumber('0'),
}

export function createVault$(
  connectedContext$: Observable<ContextConnected>,
  id: string,
): Observable<Vault> {
  return connectedContext$.pipe(
    switchMap(() => of({ ...mockVault, id })),
    take(1),
  )
}
