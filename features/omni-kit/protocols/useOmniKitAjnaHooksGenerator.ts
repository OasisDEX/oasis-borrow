import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { useAjnaHeadlineDetails } from 'features/omni-kit/protocols/hooks/useAjnaHeadlineDetails'
import type { OmniKitHooksGeneratorResponse } from 'features/omni-kit/types'

interface OmniKitAjnaHooksGeneratorProps {
  position?: AjnaGenericPosition
}

export function useOmniKitAjnaHooksGenerator({
  position,
}: OmniKitAjnaHooksGeneratorProps): OmniKitHooksGeneratorResponse | undefined {
  return position
    ? {
        useHeadlineDetails: () => {
          return useAjnaHeadlineDetails({ position })
        },
      }
    : undefined
}
