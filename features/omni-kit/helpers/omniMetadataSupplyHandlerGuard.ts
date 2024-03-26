import type {
  OmniLendingMetadataHandlers,
  OmniSupplyMetadataHandlers,
} from 'features/omni-kit/types'

export const omniMetadataSupplyHandlerGuard = (
  handlers: OmniLendingMetadataHandlers | OmniSupplyMetadataHandlers | undefined,
): handlers is OmniSupplyMetadataHandlers => !!(handlers && 'customReset' in handlers)
