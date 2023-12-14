import { z } from 'zod'
import { addressSchema, urlOptionalSchema, protocolIdsSchema } from 'shared/validators'
import { ChainId, ProtocolId } from 'shared/domain-types'

export const PRICE_DECIMALS = 6n
export const PERCENT_DECIMALS = 4n
export const ONE_PERCENT = 100n

export const MULTIPLY_DECIMALS = 2n

export const bigIntSchema = z
  .string()
  .refine((value) => isBigInt(value), {
    params: {
      code: 'not-bigint',
    },
    message: 'Must be a BigInt without decimals',
  })
  .transform((value) => BigInt(value))
  .or(z.bigint())

export const priceSchema = bigIntSchema.describe(`Price with ${PRICE_DECIMALS} decimals`)

export const maxGasFeeSchema = bigIntSchema.describe('Max gas fee in Gwei')

const isBigInt = (value: string) => {
  try {
    BigInt(value)
    return true
  } catch (error) {
    if (error instanceof SyntaxError) {
      return false
    }
    throw error
  }
}

export const ltvSchema = bigIntSchema.refine((ltv) => ltv > 0n && ltv < 10_000n, {
  params: {
    code: 'ltv-out-of-range',
  },
  message: 'LTV must be between 0 and 10_000',
})

export const aaveBasicBuyTriggerDataSchema = z.object({
  type: z
    .any()
    .optional()
    .transform(() => 119n),
  executionLTV: ltvSchema,
  targetLTV: ltvSchema,
  maxBuyPrice: priceSchema,
  maxBaseFee: maxGasFeeSchema,
})

export const aaveBasicSellTriggerDataSchema = z.object({
  type: z
    .any()
    .optional()
    .transform(() => 120n),
  executionLTV: ltvSchema,
  targetLTV: ltvSchema,
  minSellPrice: priceSchema,
  maxBaseFee: maxGasFeeSchema,
})

export const tokenSchema = z.object({
  address: addressSchema,
  symbol: z.string(),
  decimals: z.number().gt(0),
})

export const tokenBalanceSchema = z.object({
  token: tokenSchema,
  balance: bigIntSchema,
})

export const positionAddressesSchema = z.object({
  collateral: addressSchema,
  debt: addressSchema,
})

export const positionSchema = z.object({
  collateral: tokenBalanceSchema,
  debt: tokenBalanceSchema,
  ltv: ltvSchema,
  address: addressSchema,
})

export const eventBodyAaveBasicBuySchema = z.object({
  dpm: addressSchema,
  triggerData: aaveBasicBuyTriggerDataSchema,
  position: positionAddressesSchema,
  rpc: urlOptionalSchema,
})

export const eventBodyAaveBasicSellSchema = z.object({
  dpm: addressSchema,
  triggerData: aaveBasicSellTriggerDataSchema,
  position: positionAddressesSchema,
  rpc: urlOptionalSchema,
})

export enum SupportedTriggers {
  AutoBuy = 'auto-buy',
  AutoSell = 'auto-sell',
}

const supportedTriggersSchema = z.nativeEnum(SupportedTriggers)
const supportedChainsSchema = z
  .string()
  .transform((id) => parseInt(id, 10))
  .refine((id) => Object.values(ChainId).includes(id), { message: 'Unsupported chain id' })

const supportedProtocolsSchema = z.nativeEnum(ProtocolId)

export const pathParamsSchema = z.object({
  trigger: supportedTriggersSchema,
  chainId: supportedChainsSchema,
  protocol: supportedProtocolsSchema,
})
