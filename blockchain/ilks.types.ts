import type BigNumber from 'bignumber.js'
import type { DogIlk } from 'blockchain/calls/dog'
import type { JugIlk } from 'blockchain/calls/jug'
import type { SpotIlk } from 'blockchain/calls/spot'
import type { VatIlk } from 'blockchain/calls/vat'

interface DerivedIlkData {
  token: string
  ilk: string
  ilkDebt: BigNumber
  ilkDebtAvailable: BigNumber
  collateralizationDangerThreshold: BigNumber
  collateralizationWarningThreshold: BigNumber
}
export type IlkData = VatIlk & SpotIlk & JugIlk & DogIlk & DerivedIlkData

export type IlkDataList = IlkData[]

export interface IlkDataChange {
  kind: 'ilkData'
  ilkData: IlkData
}
