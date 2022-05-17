import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { ProductCardData } from 'helpers/productCards'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Box, Button, Card, Flex, Heading, Image, Spinner, Text } from 'theme-ui'

import { useWindowSize } from '../helpers/useWindowSize'
import { fadeInAnimation } from '../theme/animations'
import { FloatingLabel } from './FloatingLabel'
import { AppLink } from './Links'
import { WithArrow } from './WithArrow'

function InactiveCard() {
  return (
    <Box sx={fadeInAnimation}>
      <Card
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'primary',
          position: 'absolute',
          top: 0,
          zIndex: 1,
          opacity: '0.3',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '50%',
          transform: 'translate(50%, -50%)',
          zIndex: 2,
        }}
      >
        <Box sx={{ position: 'relative', height: '40px', width: '186px' }}>
          <Box
            sx={{
              backgroundColor: 'primary',
              height: 'inherit',
              width: 'inherit',
              opacity: '0.6',
              borderRadius: '24px',
              position: 'absolute',
              top: '50%',
              right: '50%',
              transform: 'translate(50%, -50%)',
            }}
          />
          <Flex
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 'inherit',
              width: 'inherit',
              position: 'absolute',
            }}
          >
            <Icon name="lock" size="19px" />
            <Text variant="paragraph2" sx={{ color: 'secondary', fontWeight: 'semiBold', ml: 2 }}>
              Inactive
            </Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

interface ProductCardBannerProps {
  title: string
  description: string
}

export function ProductCardProtocolLink({ ilk }: Partial<ProductCardData>) {
  return (
    <Box sx={{ paddingRight: '10px' }}>
      <AppLink href={`https://makerburn.com/#/collateral/${ilk}`}>
        <WithArrow variant="styles.a" gap="1">
          {ilk}
        </WithArrow>
      </AppLink>
    </Box>
  )
}

function ProductCardBanner({ title, description }: ProductCardBannerProps) {
  const dataContainer = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const size = useWindowSize()

  useEffect(() => {
    if (dataContainer.current) {
      setContentHeight(dataContainer.current.getBoundingClientRect().height)
    }
  }, [size, description])

  return (
    <Box sx={{ position: 'relative', pb: '24px' }}>
      <Card
        opacity={0.7}
        sx={{
          mixBlendMode: 'overlay',
          backgroundColor: 'black',
          minHeight: contentHeight > 100 ? '140px' : contentHeight > 75 ? '116px' : '88px',
          border: 'unset',
        }}
      />
      <Box
        sx={{
          zIndex: 2,
          position: 'absolute',
          mixBlendMode: 'normal',
          top: '19px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
        }}
      >
        <Flex sx={{ flexDirection: 'column', alignItems: 'center' }} ref={dataContainer}>
          <Text sx={{ color: 'text.subtitle' }} variant="paragraph2">
            {title}
          </Text>
          <Text variant="paragraph1" sx={{ textAlign: 'center', fontWeight: 'semiBold' }}>
            {description}
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}

export interface ProductCardProps {
  tokenImage: string
  tokenGif: string
  title: string
  description: string
  banner: { title: string; description: string }
  button: { link: string; text: string }
  background: string
  isFull: boolean
  floatingLabelText?: string
  inactive?: boolean
  labels?: { title: string; value: ReactNode }[]
}

export function ProductCard({
  tokenImage,
  tokenGif,
  title,
  description,
  banner,
  button,
  background,
  isFull,
  floatingLabelText,
  inactive,
  labels,
}: ProductCardProps) {
  const [hover, setHover] = useState(false)
  const [clicked, setClicked] = useState(false)

  const { t } = useTranslation()

  const handleMouseEnter = useCallback(() => setHover(true), [])
  const handleMouseLeave = useCallback(() => setHover(false), [])

  const handleClick = useCallback(() => setClicked(true), [])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '608px',
        height: '100%',
      }}
    >
      <Card
        sx={{
          background,
          border: 'unset',
          p: 4,
          height: '100%',
          ...fadeInAnimation,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <Box>
            {floatingLabelText && (
              <FloatingLabel text={floatingLabelText} flexSx={{ top: 4, right: '-16px' }} />
            )}
            <Flex
              sx={{
                flexDirection: 'row',
                pb: 2,
                justifyContent: 'space-between',
              }}
            >
              <Flex sx={{ flexDirection: 'column' }}>
                <Heading
                  variant="header2"
                  as="h3"
                  sx={{ fontSize: '18px', pb: 3, textAlign: 'left', fontWeight: 'semiBold' }}
                >
                  {title}
                </Heading>
                <Text
                  sx={{ color: 'text.subtitle', pb: '12px', fontSize: '14px', textAlign: 'left' }}
                  variant="paragraph3"
                >
                  {description}
                </Text>
              </Flex>
              <Box sx={{ minWidth: '146px', flexGrow: 1, margin: 'auto' }}>
                <Image
                  src={hover ? tokenGif : tokenImage}
                  sx={{ height: '146px', width: '146px' }}
                />
              </Box>
            </Flex>
            <ProductCardBanner {...banner} />
          </Box>
          <Flex sx={{ flexDirection: 'column', justifyContent: 'space-around' }}>
            {labels?.map(({ title, value }) => {
              return (
                <Flex
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    lineHeight: '22px',
                    pb: '12px',
                    fontSize: '14px',
                  }}
                >
                  <Text sx={{ color: 'text.subtitle', pb: 1 }} variant="paragraph3">
                    {title}
                  </Text>
                  <Text variant="text.subtitle" sx={{ fontWeight: 'semiBold' }}>
                    {value}
                  </Text>
                </Flex>
              )
            })}
          </Flex>
          <Flex>
            <AppLink
              href={button.link}
              disabled={isFull}
              sx={{ width: '100%' }}
              onClick={handleClick}
            >
              <Button
                variant="primary"
                sx={{
                  width: '100%',
                  height: '54px',
                  fontWeight: 'semiBold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.13)',
                  backgroundColor: inactive || isFull ? '#80818A' : 'primary',
                  '&:hover': {
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                    transition: '0.2s ease-in',
                    backgroundColor: isFull ? '#80818A' : 'primary',
                    cursor: isFull ? 'default' : 'pointer',
                  },
                }}
              >
                {isFull ? t('full') : !clicked ? button.text : ''}
                {clicked && (
                  <Spinner
                    variant="styles.spinner.medium"
                    size={20}
                    sx={{
                      color: 'white',
                      boxSizing: 'content-box',
                    }}
                  />
                )}
              </Button>
            </AppLink>
          </Flex>
        </Flex>
      </Card>
      {inactive && <InactiveCard />}
    </Box>
  )
}

export function calculateTokenAmount(productCardData: ProductCardData) {
  const { currentCollateralPrice, balance, debtFloor } = productCardData

  const balanceAboveDebtFloor = balance?.gt(debtFloor.div(currentCollateralPrice))

  let roundedTokenAmount: BigNumber
  if (balanceAboveDebtFloor && balance) {
    roundedTokenAmount = new BigNumber(balance.toFixed(0, 3))
  } else {
    roundedTokenAmount = new BigNumber(debtFloor.div(currentCollateralPrice).toFixed(0, 3))
  }

  return {
    tokenAmount: formatCryptoBalance(roundedTokenAmount),
    roundedTokenAmount,
  }
}
