import type { views } from '@oasisdex/dma-library'

// TODO: entire file is a mock

type GetErc4626ApyParametersResponse = ReturnType<
  Parameters<typeof views.common.getErc4626Position>[1]['getVaultApyParameters']
>

export async function getErc4626ApyParameters(): GetErc4626ApyParametersResponse {
  return new Promise((resolve) =>
    resolve({
      vault: {
        apy: '0.0175',
        curator: 'Steakhouse',
        fee: '0.05',
      },
      apyFromRewards: [
        {
          token: 'WSTETH',
          value: '0.0125',
        },
        {
          token: 'MORPHO',
          value: '0.025',
          per1kUsd: '250',
        },
      ],
    }),
  )
}
