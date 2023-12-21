import {
  bytesToHex,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  stringToBytes,
  toHex,
} from 'viem'
import { automationBotAbi } from '~abi'
import { EventBody, PositionLike, AaveAutoBuyTriggerData } from '~types'
import { OPERATION_NAMES, OperationNames } from '@oasisdex/dma-library'
import { DEFAULT_DEVIATION, MAX_COVERAGE_BASE } from './defaults'
import { EncoderFunction } from './types'

export const encodeAaveAutoBuy: EncoderFunction<AaveAutoBuyTriggerData> = (
  position,
  triggerData,
  currentTrigger,
) => {
  const abiParameters = parseAbiParameters(
    'address positionAddress, uint16 triggerType, uint256 maxCoverage, address debtToken, ' +
      'address collateralToken, bytes32 operationName, uint256 executionLtv, uint256 targetLTV, ' +
      'uint256 maxBuyPrice, uint64 deviation, uint32 maxBaseFeeInGwei',
  )

  const operationName = OPERATION_NAMES.aave.v3.ADJUST_RISK_UP
  let operationNameInBytes = bytesToHex(stringToBytes(operationName, { size: 32 }))

  const encodedTriggerData = encodeAbiParameters(abiParameters, [
    position.address,
    triggerData.type,
    MAX_COVERAGE_BASE * 10n ** BigInt(position.debt.token.decimals),
    position.debt.token.address,
    position.collateral.token.address,
    operationNameInBytes,
    triggerData.executionLTV,
    triggerData.targetLTV,
    triggerData.maxBuyPrice,
    DEFAULT_DEVIATION, // 100 -> 1%
    triggerData.maxBaseFee,
  ])

  const encodedTrigger = encodeFunctionData({
    abi: automationBotAbi,
    functionName: 'addTriggers',
    args: [
      65535,
      [false],
      [currentTrigger?.id ?? 0n],
      [encodedTriggerData],
      [currentTrigger?.triggerData ?? '0x0'],
      [triggerData.type],
    ],
  })

  return {
    encodedTriggerData,
    encodedTrigger,
  }
}
