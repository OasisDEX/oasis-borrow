import { getToken } from 'blockchain/tokensMetadata'
import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { ProductType } from 'features/oasisCreate/types'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Heading } from 'theme-ui'

export const ALL_ASSETS = 'all assets'

// TODO: remove when connected to real data
const tokenOptions = {
  all: {
    title: 'All assets',
    value: ALL_ASSETS,
  },
  ETH: {
    title: 'Ether',
    description: 'ETH',
    value: 'ETH',
    icon: getToken('ETH').iconCircle,
  },
  WBTC: {
    title: 'Wrapped BTC',
    description: 'WBTC',
    value: 'WBTC',
    icon: getToken('WBTC').iconCircle,
  },
  USDC: {
    title: 'USDCoin',
    description: 'USDC',
    value: 'USDC',
    icon: getToken('USDC').iconCircle,
  },
  DAI: {
    title: 'DAI stablecoin',
    description: 'DAI',
    value: 'DAI',
    icon: getToken('DAI').iconCircle,
  },
}

interface NaturalLanguageSelectorControllerProps {
  product: ProductType
  url?: string
  onChange?: (product: ProductType, token: string) => void
}

export function NaturalLanguageSelectorController({
  product,
  url,
  onChange,
}: NaturalLanguageSelectorControllerProps) {
  const { t } = useTranslation()

  // TODO: replace with actual data taken from **somewhere**
  const options: { product: HeaderSelectorOption; tokens: HeaderSelectorOption[] }[] = [
    {
      product: {
        title: t('nav.borrow'),
        description: t('oasis-create.select.borrow'),
        value: 'borrow',
        icon: ['selectBorrow', 'selectBorrowActive'],
      },
      tokens: [tokenOptions.all, tokenOptions.ETH, tokenOptions.WBTC, tokenOptions.USDC],
    },
    {
      product: {
        title: t('nav.multiply'),
        description: t('oasis-create.select.multiply'),
        value: 'multiply',
        icon: ['selectMultiply', 'selectMultiplyActive'],
      },
      tokens: [tokenOptions.all, tokenOptions.ETH, tokenOptions.WBTC, tokenOptions.USDC],
    },
    {
      product: {
        title: t('nav.earn'),
        description: t('oasis-create.select.earn'),
        value: 'earn',
        icon: ['selectEarn', 'selectEarnActive'],
      },
      tokens: [
        tokenOptions.all,
        tokenOptions.ETH,
        tokenOptions.WBTC,
        tokenOptions.DAI,
        tokenOptions.USDC,
      ],
    },
  ]

  const defaultProductOption = options.filter((option) => option.product.value === product)[0]
  const [overwriteOption, setOverwriteOption] = useState<HeaderSelectorOption>()
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(
    defaultProductOption.product.value as ProductType,
  )
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
          defaultOption={defaultProductOption.product}
          gradient={['#2a30ee', '#a4a6ff']}
          options={options.map((option) => option.product)}
          parentRef={ref}
          withHeaders={true}
          onChange={(selected) => {
            setSelectedProduct(selected.value as ProductType)
            setOverwriteOption(
              !options
                .filter((option) => option.product.value === selected.value)[0]
                .tokens.some((option) => option.value === selectedToken)
                ? options.filter((option) => option.product.value === selected.value)[0].tokens[0]
                : undefined,
            )
            if (url) void push(`${url}${selected.value}`)
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
