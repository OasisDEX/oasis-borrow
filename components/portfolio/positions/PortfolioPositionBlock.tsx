import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AppLink } from 'components/Links'
import { PortfolioPositionAutomationIcons } from 'components/portfolio/positions/PortfolioPositionAutomationIcons'
import { PortfolioPositionBlockDetail } from 'components/portfolio/positions/PortfolioPositionBlockDetail'
import { ProtocolLabel } from 'components/ProtocolLabel'
import dayjs from 'dayjs'
import { OmniProductType } from 'features/omni-kit/types'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { LendingProtocolLabel } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Button, Flex, Text } from 'theme-ui'

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
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
        <Text variant="boldParagraph3" color="neutral80">
          {position.availableToMigrate ? tPortfolio('migrate') : upperFirst(position.type)}
          {position.lendingType && ` - ${tPortfolio(`lending-type.${position.lendingType}`)}`}
        </Text>
        <Flex>
          <ProtocolLabel network={position.network} protocol={position.protocol} />
        </Flex>
      </Flex>
      <AssetsTableDataCellAsset
        asset={`${position.primaryToken}/${position.secondaryToken}`}
        icons={[position.primaryToken, position.secondaryToken]}
        positionId={!position.availableToMigrate ? position.positionId.toString() : undefined}
        description={
          position.availableToMigrate
            ? `${LendingProtocolLabel[position.protocol]} Borrowing`
            : undefined
        }
      />
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between',
          mt: '24px',
          mb: 3,
          ...(!position.availableToMigrate && {
            borderBottom: '1px solid',
            borderColor: 'neutral20',
            pb: 3,
          }),
        }}
      >
        {position.details.map((detail) => (
          <PortfolioPositionBlockDetail detail={detail} key={detail.type} />
        ))}
      </Flex>
      {!position.availableToMigrate && (
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {[OmniProductType.Borrow, OmniProductType.Multiply].includes(position.type) && (
            <Flex sx={{ flexDirection: 'column' }}>
              {Object.keys(position.automations).length > 0 && (
                <>
                  <Text variant="paragraph4" color="neutral80" sx={{ mb: 2 }}>
                    {tPortfolio('automations')}
                  </Text>
                  <Flex sx={{ justifyContent: 'space-between', columnGap: 1 }}>
                    <PortfolioPositionAutomationIcons automations={position.automations} />
                  </Flex>
                </>
              )}
            </Flex>
          )}
          {[OmniProductType.Earn].includes(position.type) && position.openDate && (
            <Flex>
              <Text variant="boldParagraph3" color="neutral80">
                {tPortfolio('days-of-earning', {
                  days: dayjs().diff(dayjs.unix(position.openDate), 'day'),
                })}
              </Text>
            </Flex>
          )}
          <Flex sx={{ alignSelf: 'flex-end' }}>
            <AppLink href={position.url}>
              <Button variant="tertiary">{tPortfolio('view-position')}</Button>
            </AppLink>
          </Flex>
        </Flex>
      )}
    </Box>
  )
}
