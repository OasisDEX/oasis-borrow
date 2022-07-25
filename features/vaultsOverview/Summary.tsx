import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { getToken } from '../../blockchain/tokensMetadata'
import { formatCryptoBalance, formatPercent } from '../../helpers/formatters/format'
import { zero } from '../../helpers/zero'
import { VaultSummary } from './vaultSummary'

function Graph({ assetRatio }: { assetRatio: Dictionary<BigNumber> }) {
  const assets = Object.entries(assetRatio).sort(([, ratioA], [, ratioB]) =>
    ratioB.comparedTo(ratioA),
  )

  const totalRatio = assets.reduce(
    (acc, [_, ratio]) => (ratio.isNaN() ? acc : acc.plus(ratio)),
    zero,
  )

  return (
    <Box sx={{ gridColumn: ['1/2', '1/5', '1/5'], my: 3 }}>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 'small',
          display: ['none', 'flex', 'flex'],
        }}
      >
        {totalRatio.gt(zero) &&
          assets.map(([token, ratio]) => (
            <Box
              key={token}
              sx={{
                position: 'relative',
                flex: ratio.toString(),
                height: 4,
                '&:before': {
                  boxShadow: 'medium',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  content: `''`,
                  height: 2,
                  background: getToken(token).color || 'lightGray',
                },
                '&:first-of-type:before': {
                  borderTopLeftRadius: 'small',
                  borderBottomLeftRadius: 'small',
                },
                '&:last-of-type:before': {
                  borderTopRightRadius: 'small',
                  borderBottomRightRadius: 'small',
                },
                ...(ratio.lt(0.08)
                  ? {
                      '&:hover:after': {
                        opacity: 1,
                        transform: 'translate(-50%, -40px)',
                      },
                      '&:after': {
                        transition: 'ease-in-out 0.2s',
                        opacity: 0,
                        whiteSpace: 'nowrap',
                        content: `'${token}: ${formatPercent(ratio.times(100), { precision: 2 })}'`,
                        position: 'absolute',
                        left: '50%',
                        background: 'white',
                        padding: 2,
                        borderRadius: 'small',
                        transform: 'translate(-50%, 0)',
                        boxShadow: 'neutral10',
                        fontFamily: 'body',
                        fontWeight: 'body',
                        lineHeight: 'body',
                        fontSize: 1,
                        color: 'white',
                        bg: 'primary100',
                      },
                    }
                  : {}),
              }}
            />
          ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: ['column', 'row', 'row'] }}>
        <Box
          as="hr"
          sx={{
            display: ['block', 'none', 'none'],
            borderColor: 'neutral20',
            borderWidth: '1px',
            borderTop: 'none',
            mb: 3,
          }}
        />
        {assets.map(([token, ratio]) => (
          <Box key={token} sx={{ mb: 3, flex: ratio.toString() }}>
            <Box
              sx={{
                position: 'relative',
                top: '-14px',
                alignItems: 'center',
                display: ['flex', ...(ratio.gt(0.08) ? ['flex', 'flex'] : ['none', 'none'])],
              }}
            >
              <Box sx={{ mr: 1 }}>
                <Icon
                  name={getToken(token).iconCircle}
                  size="32px"
                  sx={{ verticalAlign: 'sub', mr: 2 }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  flexDirection: ['row', 'column', 'column'],
                }}
              >
                <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
                  {token}
                </Text>
                <Text variant="paragraph3" sx={{ color: 'neutral80', ml: [2, 0, 0] }}>
                  {formatPercent(ratio.isNaN() ? zero : ratio.times(100), { precision: 2 })}
                </Text>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function Summary({ summary }: { summary: VaultSummary }) {
  const { t } = useTranslation()
  return (
    <Card variant="surface" sx={{ mb: 5, px: 4 }}>
      <Grid sx={{ pt: 3 }} columns={['1fr', 'repeat(4, 1fr)', 'repeat(4, 1fr)']}>
        <Box sx={{ gridColumn: ['initial', 'span 2', 'initial'] }}>
          <Text variant="paragraph2" sx={{ color: 'neutral80' }}>
            {t('vaults-overview.number-of-vaults')}
          </Text>
          <Text variant="header2" sx={{ mt: 2 }}>
            {summary.numberOfVaults}
          </Text>
        </Box>
        <Box sx={{ gridColumn: ['initial', 'span 2', 'initial'] }}>
          <Text variant="paragraph2" sx={{ color: 'neutral80' }}>
            {t('vaults-overview.total-locked')}
          </Text>
          <Text variant="header2" sx={{ mt: 2 }}>
            ${formatCryptoBalance(summary.totalCollateralPrice)}
          </Text>
        </Box>
        <Box
          sx={{ gridRow: ['initial', '2/3', 'auto'], gridColumn: ['initial', 'span 2', 'initial'] }}
        >
          <Text variant="paragraph2" sx={{ color: 'neutral80' }}>
            {t('vaults-overview.total-debt')}
          </Text>
          <Text variant="header2" sx={{ mt: 2 }}>
            {formatCryptoBalance(summary.totalDaiDebt)}
            <Text sx={{ fontSize: '20px', display: 'inline', ml: 2 }}>DAI</Text>
          </Text>
        </Box>
        <Box sx={{ gridRow: ['initial', '2/3', 'auto'] }}>
          <Text variant="paragraph2" sx={{ color: 'neutral80' }}>
            {t('vaults-overview.vaults-at-risk')}
          </Text>
          <Text variant="header2" sx={{ mt: 2 }}>
            {summary.vaultsAtRisk}
          </Text>
        </Box>
        <Graph assetRatio={summary.depositedAssetRatio} />
      </Grid>
    </Card>
  )
}
