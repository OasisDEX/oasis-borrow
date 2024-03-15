import BigNumber from 'bignumber.js'
import { Icon } from 'components/Icon'
import { TokensGroup } from 'components/TokensGroup'
import type { GetErc4626ApyParams } from 'features/omni-kit/protocols/erc-4626/helpers'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { bar_chart } from 'theme/icons'
import { Flex, Grid, Text } from 'theme-ui'

type Erc4626ApyTooltipProps = GetErc4626ApyParams

interface Erc4626ApyTooltipRowProps {
  footnote?: string
  label: string
  token?: string
  value: BigNumber
}

const Erc4626ApyTooltipRow: FC<Erc4626ApyTooltipRowProps> = ({ footnote, label, token, value }) => {
  return (
    <>
      <Flex sx={{ alignItems: 'center', columnGap: 1 }}>
        <Flex sx={{ justifyContent: 'center', width: '18px' }}>
          {token ? (
            <TokensGroup tokens={[token]} forceSize={18} />
          ) : (
            <Icon icon={bar_chart} size={12} />
          )}
        </Flex>
        <Text variant="paragraph4">{label}</Text>
      </Flex>
      <Text variant="paragraph4" sx={{ textAlign: 'right' }}>
        {formatDecimalAsPercent(value)}
      </Text>
      {footnote && (
        <Text
          variant="paragraph4"
          sx={{ gridColumn: '1 / -1', mt: '-4px', color: 'neutral80', textAlign: 'left' }}
        >
          {footnote}
        </Text>
      )}
    </>
  )
}

export const Erc4626ApyTooltip: FC<Erc4626ApyTooltipProps> = ({ rewardsApy, vaultApy }) => {
  const { t } = useTranslation()

  return (
    <Grid sx={{ gridTemplateColumns: '3fr 1fr', gap: 2, minWidth: '180px' }}>
      <Erc4626ApyTooltipRow
        label={t('erc-4626.position-page.common.market-apy')}
        value={vaultApy}
      />
      {rewardsApy.map(({ per1kUsd, token, value }) => (
        <Erc4626ApyTooltipRow
          key={token}
          label={token}
          value={value}
          token={token}
          {...(per1kUsd && {
            footnote: t('erc-4626.position-page.common.per-1k-usd', {
              amount: per1kUsd.dp(0, BigNumber.ROUND_HALF_EVEN),
              token,
            }),
          })}
        />
      ))}
    </Grid>
  )
}
