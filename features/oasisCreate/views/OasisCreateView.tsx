import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { NaturalLanguageSelectorController } from 'features/oasisCreate/controls/NaturalLanguageSelectorController'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import { OasisCreateProduct } from 'pages/oasis-create/[product]'
import React, { useState } from 'react'
import { Box, Text } from 'theme-ui'

interface OasisCreateViewProps {
  product: OasisCreateProduct
}

const LINKS_MAP = {
  borrow: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
  multiply: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
  earn: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
}

export function OasisCreateView({ product }: OasisCreateViewProps) {
  const { t } = useTranslation()
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [selectedToken, setSelectedToken] = useState<string>()

  return (
    <AnimatedWrapper>
      <Box
        sx={{
          my: [3, null, '48px'],
          textAlign: 'center',
        }}
      >
        <NaturalLanguageSelectorController
          product={product}
          url="/oasis-create/"
          onChange={(product, token) => {
            setSelectedProduct(product)
            setSelectedToken(token)
          }}
        />
        <Text
          as="p"
          variant="paragraph2"
          sx={{
            mx: 'auto',
            mt: '24px',
            color: 'neutral80',
          }}
        >
          {t(`oasis-create.intro.${product}`)}{' '}
          <AppLink href={LINKS_MAP[product]}>
            <WithArrow
              variant="paragraph2"
              sx={{
                display: 'inline-block',
                fontSize: 3,
                color: 'interactive100',
                fontWeight: 'regular',
              }}
            >
              Oasis.app {t(`nav.${product}`)}
            </WithArrow>
          </AppLink>
        </Text>
      </Box>
      <AssetsTableContainer padded>
        There should be Oasis Create table in there displaying all{' '}
        <strong>{selectedProduct}</strong> products filtered by <strong>{selectedToken}</strong>.
      </AssetsTableContainer>
    </AnimatedWrapper>
  )
}
