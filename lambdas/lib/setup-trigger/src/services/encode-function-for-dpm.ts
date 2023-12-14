import { encodeFunctionData } from 'viem'
import { accountImplementationAbi } from '~abi'
import { Address } from 'shared/domain-types'
import { Addresses } from './get-addresses'

export interface EncodeFunctionForDpmParams {
  dpm: Address
  encodedTrigger: `0x${string}`
}

export interface TransactionFragment {
  to: `0x${string}`
  data: `0x${string}`
}

export function encodeFunctionForDpm(
  { dpm, encodedTrigger }: EncodeFunctionForDpmParams,
  addresses: Addresses,
): TransactionFragment {
  const dpmData = encodeFunctionData({
    abi: accountImplementationAbi,
    functionName: 'execute',
    args: [addresses.AutomationBot, encodedTrigger],
  })

  return {
    to: dpm,
    data: dpmData,
  }
}
