import {
  PositionLike,
  AaveAutoBuyTriggerData,
  AaveAutoSellTriggerData,
  TriggerData,
  SupportedTriggers,
} from '~types'
import { ProtocolId } from 'shared/domain-types'

export type EncoderFunction<TTriggerData extends TriggerData> = (
  position: PositionLike,
  triggerData: TTriggerData,
  currentTrigger: { id: bigint; triggerData: `0x${string}` } | undefined,
) => {
  encodedTriggerData: `0x${string}`
  encodedTrigger: `0x${string}`
}

export type TriggerEncoders = {
  [ProtocolId.AAVE3]: {
    [SupportedTriggers.AutoBuy]: EncoderFunction<AaveAutoBuyTriggerData>
    [SupportedTriggers.AutoSell]: EncoderFunction<AaveAutoSellTriggerData>
  }
}
