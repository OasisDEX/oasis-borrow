import type { Result } from '@ethersproject/abi'

export interface TriggerDataType {
  triggerId: number
  result: Result
  executionParams: string
  commandAddress: string
}
