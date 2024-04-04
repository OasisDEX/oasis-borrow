import BigNumber from 'bignumber.js'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import type { ProductHubItem } from 'features/productHub/types'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Text } from 'theme-ui'

interface LowerLiquidationPriceProps {
  positionId: number | string
  collateral: BigNumber
  debt: BigNumber
  debtPrice: BigNumber
  liquidationPrice: BigNumber
  table: ProductHubItem[]
  refinanceToProtocols?: LendingProtocol[]
}

const LowerLiquidationPrice: FC<LowerLiquidationPriceProps> = ({
  positionId,
  collateral,
  debt,
  debtPrice,
  liquidationPrice,
  table,
  refinanceToProtocols,
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const itemWithHighestMaxLtv = table
    .filter((item) => refinanceToProtocols?.includes(item.protocol))
    .reduce((prev, current) => {
      return prev && Number(prev?.maxLtv) > Number(current?.maxLtv) ? prev : current
    })

  if (!itemWithHighestMaxLtv.maxLtv) {
    return (
      <Text as="span" variant="boldParagraph3" color="primary100">
        {tPortfolio('refinance.banner.default', {
          id: positionId,
        })}
      </Text>
    )
  }

  const refinanceLiquidationPrice = debt
    .times(debtPrice)
    .div(collateral.times(itemWithHighestMaxLtv.maxLtv))

  const liquidationPriceChange = liquidationPrice
    .minus(refinanceLiquidationPrice)
    .div(liquidationPrice)

  return (
    <Text as="span" variant="boldParagraph3" color="primary100">
      {tPortfolio('refinance.banner.lowerLiquidationPrice', {
        id: positionId,
        value: formatDecimalAsPercent(liquidationPriceChange),
      })}
    </Text>
  )
}

interface RefinancePortfolioBannerProps {
  position: PortfolioPosition
}

export const RefinancePortfolioBanner: FC<RefinancePortfolioBannerProps> = ({ position }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const {
    productHub: { table },
  } = usePreloadAppDataContext()

  if (!position.rawPositionDetails) {
    return null
  }

  const { rawPositionDetails } = position

  const collateral = new BigNumber(rawPositionDetails.collateral)
  const debt = new BigNumber(rawPositionDetails.debt)
  const debtPrice = new BigNumber(rawPositionDetails.debtPrice)
  const liquidationPrice = new BigNumber(rawPositionDetails.liquidationPrice)

  const refinanceToProtocols = {
    [LendingProtocol.Maker]: [LendingProtocol.SparkV3],
    [LendingProtocol.Ajna]: [],
    [LendingProtocol.AaveV3]: [],
    [LendingProtocol.AaveV2]: [],
    [LendingProtocol.SparkV3]: [],
    [LendingProtocol.MorphoBlue]: [],
  }[position.protocol]

  const content = {
    [LendingProtocol.Maker]: (
      <LowerLiquidationPrice
        liquidationPrice={liquidationPrice}
        debtPrice={debtPrice}
        debt={debt}
        positionId={position.positionId}
        collateral={collateral}
        refinanceToProtocols={refinanceToProtocols}
        table={table}
      />
    ),
    [LendingProtocol.Ajna]: null,
    [LendingProtocol.AaveV3]: null,
    [LendingProtocol.AaveV2]: null,
    [LendingProtocol.SparkV3]: null,
    [LendingProtocol.MorphoBlue]: null,
  }[position.protocol]

  return content ? (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: '24px',
        backgroundColor: 'neutral30',
        py: 2,
        px: 3,
        borderRadius: 'round',
        flexWrap: 'wrap',
      }}
    >
      {content}
      <Button variant="textual" sx={{ p: 'unset' }} onClick={() => {}}>
        {tPortfolio('refinance.title')}
      </Button>
    </Flex>
  ) : null
}
