import { getToken } from 'blockchain/tokensMetadata'
import { HeaderSelector } from 'components/HeaderSelector'
import { AppLink } from 'components/Links'
import { ajnaPairs, DEFAULT_SELECTED_TOKEN } from 'features/ajna/common/consts'
import { AjnaProduct } from 'features/ajna/common/types'
import { DiscoverTable } from 'features/discover/common/DiscoverTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React, { useRef } from 'react'
import { Box, Button, Heading, Text } from 'theme-ui'

interface AjnaSelectorControllerProps {
  product: AjnaProduct
}

export function AjnaSelectorController({ product }: AjnaSelectorControllerProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const [hash] = useHash()

  const options = Object.keys(ajnaPairs[product]).map((token) => ({
    label: token,
    value: token,
    icon: getToken(token).iconCircle,
  }))
  const defaultOptionValue = hash.length ? hash.replace('#', '') : DEFAULT_SELECTED_TOKEN
  const defaultOption = options.filter((option) => option.value === defaultOptionValue)[0]

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
          />
          {t(`ajna.${product}.open.select.heading.post`)}
        </Heading>
        <Text variant="paragraph2" sx={{ color: 'neutral80', maxWidth: 700, mx: 'auto' }}>
          {t(`ajna.${product}.open.select.intro`)}
        </Text>
      </Box>
      <DiscoverTableContainer title="Filters?">
        <DiscoverTable
          rows={[
            {
              asset: 'WBTC',
              minPositionSize: '$0.00',
              maxLTV: '82%',
              liquidityAvaliable: '$90.49m',
              annualFee: '1.25%',
              protocol: <button>asd</button>,
              action: (
                <AppLink href="asd" internalInNewTab={true}>
                  <Button className="discover-action" variant="tertiary">
                    {t('borrow')}
                  </Button>
                </AppLink>
              ),
            },
          ]}
        />
      </DiscoverTableContainer>
    </Box>
  )
}
