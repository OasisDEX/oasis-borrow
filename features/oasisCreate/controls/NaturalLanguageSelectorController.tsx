import { getToken } from 'blockchain/tokensMetadata'
import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { useTranslation } from 'next-i18next'
import React, { useRef, useState } from 'react'
import { Box, Heading } from 'theme-ui'

// TODO: remove when connected to real data
const tokenOptions = {
  all: {
    title: 'All assets',
    value: 'all assets',
  },
  ETH: {
    title: 'Ether',
    description: 'ETH',
    value: 'ETH',
    icon: getToken('ETH').iconCircle,
  },
  USDC: {
    title: 'USDCoin',
    description: 'USDC',
    value: 'USDC',
    icon: getToken('USDC').iconCircle,
  },
  WBTC: {
    title: 'Wrapped BTC',
    description: 'WBTC',
    value: 'WBTC',
    icon: getToken('WBTC').iconCircle,
  },
  DAI: {
    title: 'DAI stablecoin',
    description: 'DAI',
    value: 'DAI',
    icon: getToken('DAI').iconCircle,
  },
  stETH: {
    title: 'Staked ETH',
    description: 'stETH',
    value: 'stETH',
    icon: getToken('WSTETH').iconCircle,
  },
}

export function NaturalLanguageSelectorController() {
  const { t } = useTranslation()

  // TODO: replace with actual data taken from **somewhere**
  const options = [
    {
      product: {
        title: t('nav.borrow'),
        description: t('oasis-create.select.borrow'),
        value: t('nav.borrow').toLowerCase(),
        icon: 'selectBorrow',
      },
      tokens: [tokenOptions.all, tokenOptions.ETH, tokenOptions.WBTC, tokenOptions.USDC],
    },
    {
      product: {
        title: t('nav.multiply'),
        description: t('oasis-create.select.multiply'),
        value: t('nav.multiply').toLowerCase(),
        icon: 'selectMultiply',
      },
      tokens: [
        tokenOptions.all,
        tokenOptions.ETH,
        tokenOptions.stETH,
        tokenOptions.DAI,
        tokenOptions.USDC,
      ],
    },
    {
      product: {
        title: t('nav.earn'),
        description: t('oasis-create.select.earn'),
        value: t('nav.earn').toLowerCase(),
        icon: 'selectEarn',
      },
      tokens: [tokenOptions.all, tokenOptions.WBTC, tokenOptions.ETH, tokenOptions.stETH],
    },
  ]

  const [overwriteOption, setOverwriteOption] = useState<HeaderSelectorOption>()
  const [product, setProduct] = useState<string>(options[0].product.value)
  const [token, setToken] = useState<string>(options[0].tokens[0].value)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <Box ref={ref}>
      <Heading as="h1" variant="header2" sx={{ position: 'relative', zIndex: 2 }}>
        I want to
        <HeaderSelector
          gradient={['#2a30ee', '#a4a6ff']}
          options={options.map((option) => option.product)}
          parentRef={ref}
          withHeaders={true}
          onChange={(selected) => {
            setProduct(selected.value)

            setOverwriteOption(
              !options
                .filter((option) => option.product.value === selected.value)[0]
                .tokens.some((option) => option.value === token)
                ? options.filter((option) => option.product.value === selected.value)[0].tokens[0]
                : undefined,
            )
          }}
        />
        with
        <HeaderSelector
          gradient={['#2a30ee', '#a4a6ff']}
          options={options.filter((option) => option.product.value === product)[0].tokens}
          overwriteOption={overwriteOption}
          parentRef={ref}
          valueAsLabel={true}
          onChange={(selected) => {
            setToken(selected.value)
          }}
        />
      </Heading>
    </Box>
  )
}
