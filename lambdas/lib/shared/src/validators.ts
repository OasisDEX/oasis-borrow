import { z } from 'zod'

import { isValidAddress } from './guards'
import { Address, ChainId, ProtocolId } from './domain-types'
import { MIGRATION_SUPPORTED_CHAIN_IDS, MIGRATION_SUPPORTED_PROTOCOL_IDS } from './constants'

export const addressSchema = z.custom<Address>((val: unknown) => {
  return isValidAddress(val)
}, 'Invalid address format')

export const chainIdsSchema = z
  .string()
  .transform((val) => val.split(',').map(Number))
  .transform((val) => {
    return z.nativeEnum(ChainId).array().parse(val)
  })
  .refine(
    (val) => {
      return val.every((protocolId) => MIGRATION_SUPPORTED_CHAIN_IDS.includes(protocolId))
    },
    { message: 'Unsupported chain id' },
  )

export const protocolIdsSchema = z
  .string()
  .transform((val) => val.split(','))
  .transform((val) => {
    return z.nativeEnum(ProtocolId).array().parse(val)
  })
  .refine(
    (val) => {
      // foreach val in val, check if it is a valid protocol id
      return val.every((protocolId) => MIGRATION_SUPPORTED_PROTOCOL_IDS.includes(protocolId))
    },
    { message: 'Unsupported protocol id' },
  )

export const urlOptionalSchema = z.string().url().optional()
