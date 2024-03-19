import { Icon } from 'components/Icon'
import { Skeleton } from 'components/Skeleton'
import { StatefulTooltip } from 'components/Tooltip'
import { omniDefaultOverviewSimulationDeposit } from 'features/omni-kit/constants'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import { Erc4626ApyTooltip } from 'features/omni-kit/protocols/erc-4626/components'
import { useErc4626CustomState } from 'features/omni-kit/protocols/erc-4626/contexts'
import { getErc4626Apy } from 'features/omni-kit/protocols/erc-4626/helpers'
import { useErc4626ApySimulation } from 'features/omni-kit/protocols/erc-4626/hooks'
import { OmniProductType } from 'features/omni-kit/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import React, { type FC } from 'react'
import { sparks } from 'theme/icons'
import { Box, Text } from 'theme-ui'

interface Erc4626HeadlineApyProps {
  vaultAddress: string
}

export const Erc4626HeadlineApy: FC<Erc4626HeadlineApyProps> = ({ vaultAddress }) => {
  const {
    form: {
      state: { depositAmount },
    },
  } = useOmniProductContext(OmniProductType.Earn)
  const {
    state: { estimatedPrice },
  } = useErc4626CustomState()

  const { apy, isLoading } = useErc4626ApySimulation({
    depositAmount: depositAmount ?? omniDefaultOverviewSimulationDeposit,
    vaultAddress,
    rewardTokenPrice: estimatedPrice,
  })

  return (
    <>
      {!isLoading && apy ? (
        <>
          <Text as="span" sx={{ ml: 1, fontWeight: 'semiBold', color: 'primary100' }}>
            {formatDecimalAsPercent(
              getErc4626Apy({
                rewardsApy: apy.rewardsApy.per365d,
                vaultApy: apy.vaultApy.per365d,
              }),
            )}
          </Text>
          <StatefulTooltip
            tooltip={
              <Erc4626ApyTooltip
                rewardsApy={apy.rewardsApy.per365d}
                vaultApy={apy.vaultApy.per365d}
              />
            }
            containerSx={{ ml: 1 }}
            tooltipSx={{
              top: '24px',
              fontSize: 1,
              border: 'none',
              borderRadius: 'medium',
              boxShadow: 'buttonMenu',
              fontWeight: 'regular',
              lineHeight: 'body',
            }}
          >
            <Icon icon={sparks} size={16} color="interactive100" sx={{ ml: 1 }} />
          </StatefulTooltip>
        </>
      ) : (
        <Box sx={{ ml: 2, mr: 1 }}>
          <Skeleton width="75px" color="dark" />
        </Box>
      )}
    </>
  )
}
