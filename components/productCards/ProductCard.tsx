import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { ProductCardData, productCardsConfig } from 'helpers/productCards'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Box, Button, Card, Flex, Heading, Image, Spinner, Text } from 'theme-ui'

import { useWindowSize } from '../../helpers/useWindowSize'
import { fadeInAnimation } from '../../theme/animations'
import { FloatingLabel } from '../FloatingLabel'
import { AppLink } from '../Links'
import { WithArrow } from '../WithArrow'

function InactiveCard() {
  return (
    <Box sx={fadeInAnimation}>
      <Card
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'primary100',
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
              backgroundColor: 'primary100',
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
            <Text
              variant="paragraph2"
              sx={{ color: 'secondary100', fontWeight: 'semiBold', ml: 2 }}
            >
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
  const { link, name } = productCardsConfig.descriptionLinks[ilk!] ?? {
    link: `https://makerburn.com/#/collateral/${ilk}`,
    ilk,
  }
  return (
    <Box sx={{ paddingRight: '10px' }}>
      <AppLink href={link}>
        <WithArrow variant="styles.a" gap="1">
          {name}
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
    <Box sx={{ position: 'relative' }}>
      <Card
        opacity={0.7}
        sx={{
          mixBlendMode: 'overlay',
          backgroundColor: 'black',
          minHeight: contentHeight > 100 ? '140px' : '116px',
          border: 'unset',
        }}
      />
      <Box
        sx={{
          zIndex: 2,
          position: 'absolute',
          mixBlendMode: 'normal',
          top: `calc(50% - ${contentHeight / 2}px)`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
        }}
      >
        <Flex sx={{ flexDirection: 'column', alignItems: 'center' }} ref={dataContainer}>
          <Text sx={{ color: 'neutral80' }} variant="paragraph2">
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

interface ProductCardHeadingProps {
  title: string
  description: string
  tokenImage: string
  tokenGif: string
  isHover: boolean
}

function ProductCardHeading({
  title,
  description,
  tokenImage,
  tokenGif,
  isHover,
}: ProductCardHeadingProps) {
  const dataContainer = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const size = useWindowSize()

  useEffect(() => {
    if (dataContainer.current) {
      const height = dataContainer.current.getBoundingClientRect().height
      setContentHeight(height)
    }
  }, [size, description])

  return (
    <Box sx={{ minHeight: contentHeight > 170 ? '200px' : '164px' }}>
      <Flex
        sx={{
          flexDirection: 'row',
          pb: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Flex sx={{ flexDirection: 'column', gap: 1 }} ref={dataContainer}>
          <Heading variant="paragraph1" as="h3" sx={{ textAlign: 'left', fontWeight: 'semiBold' }}>
            {title}
          </Heading>
          <Text
            sx={{ color: 'neutral80', pb: '12px', fontSize: '14px', textAlign: 'left' }}
            variant="paragraph3"
          >
            {description}
          </Text>
        </Flex>
        <Box sx={{ minWidth: '146px', flexGrow: 1 }}>
          <Image src={isHover ? tokenGif : tokenImage} sx={{ height: '146px', width: '146px' }} />
        </Box>
      </Flex>
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
        <Flex
          sx={{ flexDirection: 'column', justifyContent: 'flex-start', gap: 4, height: '100%' }}
        >
          <Box>
            {floatingLabelText && (
              <FloatingLabel text={floatingLabelText} flexSx={{ top: 4, right: '-16px' }} />
            )}
            <ProductCardHeading
              tokenImage={tokenImage}
              tokenGif={tokenGif}
              title={title}
              description={description}
              isHover={hover}
            />
            <ProductCardBanner {...banner} />
          </Box>
          <Flex sx={{ flexDirection: 'column', justifyContent: 'space-around' }}>
            {labels?.map(({ title, value }, index) => {
              return (
                <Flex
                  key={`${index}-${title}`}
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    lineHeight: '22px',
                    pb: 2,
                    fontSize: '14px',
                    ':last-child': {
                      pb: '0',
                    },
                  }}
                >
                  <Text sx={{ color: 'neutral80', pb: 1 }} variant="paragraph3">
                    {title}
                  </Text>
                  <Text sx={{ fontWeight: 'semiBold', color: 'neutral80' }}>{value}</Text>
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
                  backgroundColor: inactive || isFull ? 'neutral70' : 'primary100',
                  '&:hover': {
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                    transition: '0.2s ease-in',
                    backgroundColor: isFull ? 'neutral70' : 'primary100',
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
