import { EncoderFunction } from './types'
import { encodeAbiParameters, encodeFunctionData, keccak256, parseAbiParameters } from 'viem'
import { OPERATION_NAMES } from '@oasisdex/dma-library'
import { DEFAULT_DEVIATION, MAX_COVERAGE_BASE } from './defaults'
import { automationBotAbi } from '~abi'
import { AaveAutoSellTriggerData } from '~types'

export const encodeAaveBasicSell: EncoderFunction<AaveAutoSellTriggerData> = (
  position,
  triggerData,
  currentTrigger,
) => {
  const abiParameters = parseAbiParameters(
    'address positionAddress, ' +
      'uint16 triggerType, ' +
      'uint256 maxCoverage, ' +
      'address debtToken, ' +
      'address collateralToken, ' +
      'bytes32 operationHash, ' +
      'uint256 executionLtv, ' +
      'uint256 targetLTV, ' +
      'uint256 minSellPrice, ' +
      'uint64 deviation, ' +
      'uint32 maxBaseFeeInGwei',
  )

  const opt = OPERATION_NAMES.aave.v3.ADJUST_RISK_DOWN

  const optBytes = Buffer.from(opt, 'utf8')
  const opHash = keccak256(optBytes)

  const encodedTriggerData = encodeAbiParameters(abiParameters, [
    position.address,
    triggerData.type,
    MAX_COVERAGE_BASE * 10n ** BigInt(position.debt.token.decimals),
    position.debt.token.address,
    position.collateral.token.address,
    opHash,
    triggerData.executionLTV,
    triggerData.targetLTV,
    triggerData.minSellPrice,
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
