import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { AppLink } from 'components/Links'
import { ajnaPairs, DEFAULT_SELECTED_TOKEN } from 'features/ajna/common/consts'
import { AjnaProduct } from 'features/ajna/common/types'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableRowData } from 'features/discover/types'
import { formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Heading, Text } from 'theme-ui'

interface AjnaSelectorControllerProps {
  product: AjnaProduct
}

export function AjnaSelectorController({ product }: AjnaSelectorControllerProps) {
  const { t } = useTranslation()
  const [hash] = useHash()
  const defaultOptionValue = hash.length ? hash.replace('#', '') : DEFAULT_SELECTED_TOKEN
  const ref = useRef<HTMLDivElement>(null)
  const options = Object.keys(ajnaPairs[product]).map((token) => ({
    label: token,
    value: token,
    icon: getToken(token).iconCircle,
  }))
  const defaultOption = options.filter((option) => option.value === defaultOptionValue)[0]
  const [selected, setSelected] = useState<HeaderSelectorOption>(defaultOption)
  // TODO: to be replaced with real data coming from observable
  const [rows, setRows] = useState<DiscoverTableRowData[]>([])

  useEffect(() => {
    setRows(
      ajnaPairs[product][selected.value].map((asset) => ({
        asset,
        icon: getToken(asset).iconCircle,
        minPositionSize: `$${formatFiatBalance(new BigNumber(Math.random() * 1000))}`,
        maxLTV: formatPercent(new BigNumber(Math.random() * 100), { precision: 2 }),
        liquidityAvaliable: `$${formatFiatBalance(new BigNumber(Math.random() * 10000000))}`,
        annualFee: formatPercent(new BigNumber(Math.random() * 10), { precision: 2 }),
        protocol: (
          <Text
            as="span"
            sx={{
              display: 'inline-block',
              lineHeight: '26px',
              px: '12px',
              fontSize: 2,
              fontWeight: 'regular',
              color: 'neutral10',
              borderRadius: 'mediumLarge',
              background: 'linear-gradient(90deg, #f154db 0%, #974eea 100%)',
            }}
          >
            Ajna
          </Text>
        ),
        action: (
          <AppLink href={`/ajna/open/${product}/${selected.label}-${asset}`}>
            <Button className="discover-action" variant="tertiary">
              {t(`nav.${product}`)}
            </Button>
          </AppLink>
        ),
      })),
    )
  }, [selected])

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Heading ref={ref} variant="header2" sx={{ position: 'relative', mb: 3, zIndex: 2 }}>
          {t(`ajna.${product}.open.select.heading.pre`)}
          <HeaderSelector
            defaultOption={defaultOption}
            gradient={['#f154db', '#974eea']}
            options={options}
            parentRef={ref}
            onChange={setSelected}
          />
          {t(`ajna.${product}.open.select.heading.post`)}
        </Heading>
        <Text variant="paragraph2" sx={{ color: 'neutral80', maxWidth: 700, mx: 'auto' }}>
          {t(`ajna.${product}.open.select.intro`)}
        </Text>
      </Box>
      <DiscoverTableContainer title="Filters?">
        {rows.length > 0 && <DiscoverResponsiveTable rows={rows} skip={['icon']} />}
      </DiscoverTableContainer>
    </Box>
  )
}
