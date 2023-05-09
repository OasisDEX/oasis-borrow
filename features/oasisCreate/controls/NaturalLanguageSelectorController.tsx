import { getToken } from 'blockchain/tokensMetadata'
import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { OasisCreateProduct } from 'pages/oasis-create/[product]'
import React, { useEffect, useRef, useState } from 'react'
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

interface NaturalLanguageSelectorControllerProps {
  product: OasisCreateProduct
  url?: string
  onChange?: (product: string, token: string) => void
}

export function NaturalLanguageSelectorController({
  product,
  url,
  onChange,
}: NaturalLanguageSelectorControllerProps) {
  const { t } = useTranslation()

  // TODO: replace with actual data taken from **somewhere**
  const options = [
    {
      product: {
        title: t('nav.borrow'),
        description: t('oasis-create.select.borrow'),
        value: 'borrow',
        icon: 'selectBorrow',
      },
      tokens: [tokenOptions.all, tokenOptions.ETH, tokenOptions.WBTC, tokenOptions.USDC],
    },
    {
      product: {
        title: t('nav.multiply'),
        description: t('oasis-create.select.multiply'),
        value: 'multiply',
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
        value: 'earn',
        icon: 'selectEarn',
      },
      tokens: [tokenOptions.all, tokenOptions.WBTC, tokenOptions.ETH, tokenOptions.stETH],
    },
  ]

  const defaultProductOption = options.filter((option) => option.product.value === product)[0]
  const [overwriteOption, setOverwriteOption] = useState<HeaderSelectorOption>()
  const [selectedProduct, setSelectedProduct] = useState<string>(defaultProductOption.product.value)
  const [selectedToken, setSelectedToken] = useState<string>(defaultProductOption.tokens[0].value)
  const ref = useRef<HTMLDivElement>(null)
  const { push } = useRouter()

  useEffect(() => {
    onChange && onChange(selectedProduct, selectedToken)
  }, [selectedProduct, selectedToken])

  return (
    <Box ref={ref}>
      <Heading as="h1" variant="header2" sx={{ position: 'relative', zIndex: 2 }}>
        I want to
        <HeaderSelector
          defaultOption={options.filter((option) => option.product.value === product)[0].product}
          gradient={['#2a30ee', '#a4a6ff']}
          options={options.map((option) => option.product)}
          parentRef={ref}
          withHeaders={true}
          onChange={(selected) => {
            setSelectedProduct(selected.value)
            setOverwriteOption(
              !options
                .filter((option) => option.product.value === selected.value)[0]
                .tokens.some((option) => option.value === selectedToken)
                ? options.filter((option) => option.product.value === selected.value)[0].tokens[0]
                : undefined,
            )
            void push(`${url}${selected.value}`)
          }}
        />
        with
        <HeaderSelector
          gradient={['#2a30ee', '#a4a6ff']}
          options={options.filter((option) => option.product.value === selectedProduct)[0].tokens}
          overwriteOption={overwriteOption}
          parentRef={ref}
          valueAsLabel={true}
          onChange={(selected) => {
            setSelectedToken(selected.value)
          }}
        />
      </Heading>
    </Box>
  )
}
