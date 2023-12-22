import {
  PositionLike,
  AaveAutoBuyTriggerData,
  AaveAutoSellTriggerData,
  TriggerData,
  SupportedTriggers,
} from '~types'
import { ProtocolId } from 'shared/domain-types'

export const AAVE_TRANSACTION_PRICE_DECIMALS = 8n

export type EncodedFunction = {
  encodedTriggerData: `0x${string}`
  encodedTrigger: `0x${string}`
}

export type CurrentTriggerLike = {
  id: bigint
  triggerData: `0x${string}`
}

export type EncoderFunction<TTriggerData extends TriggerData> = (
  position: PositionLike,
  triggerData: TTriggerData,
  currentTrigger: CurrentTriggerLike | undefined,
) => EncodedFunction

export type TriggerEncoders = {
  [ProtocolId.AAVE3]: {
    [SupportedTriggers.AutoBuy]: EncoderFunction<AaveAutoBuyTriggerData>
    [SupportedTriggers.AutoSell]: EncoderFunction<AaveAutoSellTriggerData>
  }
}
