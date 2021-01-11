import BigNumber from 'bignumber.js'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { ContextConnected } from '../../components/blockchain/network'

export interface Vault {
  id: string
  type: string // ilk
  owner: string //proxyAddress
  address: string // urnHandler
  proxyOwner: string //
  encumberedCollateral: BigNumber // ink
  encumberedDebt: BigNumber // art
  // --------
  collateralTypePrice: BigNumber
  debtValue: BigNumber
  collateralAmount: BigNumber
  collateralValue: BigNumber
  liquidationPrice: BigNumber
  daiAvailable: BigNumber
  collateralAvailableAmount: BigNumber
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
  return of({ ...mockVault, id })
}
