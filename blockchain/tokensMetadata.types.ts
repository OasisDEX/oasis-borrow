import type { ElementOf } from 'ts-essentials'

import type { TokenConfig } from './TokenConfig'
import type { tokens } from './tokensMetadata.constants'

export type SimplifiedTokenConfig = Pick<TokenConfig, 'name' | 'precision' | 'symbol' | 'source'>

export type TokenSymbolType = ElementOf<typeof tokens>['symbol']
export type TokenMetadataType = (typeof tokens)[number]
