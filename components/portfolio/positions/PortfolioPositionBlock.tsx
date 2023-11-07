import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AppLink } from 'components/Links'
import { PortfolioPositionAutomationIcons } from 'components/portfolio/positions/PortfolioPositionAutomationIcons'
import { PortfolioPositionBlockDetail } from 'components/portfolio/positions/PortfolioPositionBlockDetail'
import { ProtocolLabel } from 'components/ProtocolLabel'
import dayjs from 'dayjs'
import { ProductType } from 'features/aave/types'
import { LendingProtocolLabel } from 'lendingProtocols'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from 'theme-ui'

import type { PortfolioPosition } from 'lambdas/src/shared/domain-types'

export const PortfolioPositionBlock = ({ position }: { position: PortfolioPosition }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'large',
        p: 3,
      }}
    >
      <Flex sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Text variant="boldParagraph3" color="neutral80">
          {position.availableToMigrate ? tPortfolio('migrate') : position.type}
        </Text>
        <Flex>
          <ProtocolLabel network={position.network} protocol={position.protocol} />
        </Flex>
      </Flex>
      <AssetsTableDataCellAsset
        asset={
          position.tokens.borrow?.symbol
            ? `${position.tokens.supply.symbol}/${position.tokens.borrow?.symbol}`
            : position.tokens.supply.symbol
        }
        icons={
          position.tokens.borrow?.symbol
            ? [position.tokens.supply.symbol, position.tokens.borrow?.symbol]
            : [position.tokens.supply.symbol]
        }
        positionId={!position.availableToMigrate ? position.positionId.toString() : undefined}
        description={
          position.availableToMigrate
            ? `${LendingProtocolLabel[position.protocol]} Borrowing`
            : undefined
        }
      />
      <Flex
        sx={{
          justifyContent: 'space-between',
          my: 3,
          ...(!position.availableToMigrate && {
            borderBottom: '1px solid',
            borderColor: 'neutral20',
            paddingBottom: 3,
          }),
        }}
      >
        {position.details.map((detail) => (
          <PortfolioPositionBlockDetail detail={detail} key={detail.type} />
        ))}
      </Flex>
      {!position.availableToMigrate && (
        <Flex
          sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}
        >
          {position.type && [ProductType.Borrow, ProductType.Multiply].includes(position.type) && (
            <Flex sx={{ flexDirection: 'column' }}>
              <Text variant="paragraph4" color="neutral80" sx={{ mb: 2 }}>
                {tPortfolio('automations')}
              </Text>
              <Flex sx={{ justifyContent: 'space-between', columnGap: 1 }}>
                <PortfolioPositionAutomationIcons automations={position.automations} />
              </Flex>
            </Flex>
          )}
          {position.type && [ProductType.Earn].includes(position.type) && (
            <Flex sx={{ flexDirection: 'column' }}>
              <Text variant="boldParagraph3" color="neutral80" sx={{ mb: 2 }}>
                {tPortfolio('days-of-earning', {
                  days: dayjs().diff(dayjs.unix(position.openDate), 'day'),
                })}
              </Text>
            </Flex>
          )}
          <Flex>
            <AppLink
              variant="secondary"
              sx={{ fontSize: 1 }}
              href={`/${position.network}/${position.protocol}/${position.positionId}`}
            >
              {tPortfolio('view-position')}
            </AppLink>
          </Flex>
        </Flex>
      )}
    </Box>
  )
}
