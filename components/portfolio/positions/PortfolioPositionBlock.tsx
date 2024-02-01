import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AppLink } from 'components/Links'
import { Pill } from 'components/Pill'
import { PortfolioPositionAutomationIcons } from 'components/portfolio/positions/PortfolioPositionAutomationIcons'
import { PortfolioPositionBlockDetail } from 'components/portfolio/positions/PortfolioPositionBlockDetail'
import { ProtocolLabel } from 'components/ProtocolLabel'
import dayjs from 'dayjs'
import { OmniProductType } from 'features/omni-kit/types'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { getLocalAppConfig } from 'helpers/config'
import { getGradientColor } from 'helpers/getGradientColor'
import { LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Text } from 'theme-ui'

const getColorsPerProtocol = (
  protocol: LendingProtocol,
): {
  gradientText: string
  gradientBorder: string
} => {
  switch (protocol) {
    case LendingProtocol.AaveV3:
      return {
        gradientText: 'linear-gradient(230deg, #B6509E 15.42%, #2EBAC6 84.42%)',
        gradientBorder:
          'linear-gradient(white 0 0) padding-box, linear-gradient(230deg, #B6509E 15.42%, #2EBAC6 84.42%) border-box',
      }
    case LendingProtocol.SparkV3:
      return {
        gradientText: 'linear-gradient(159deg, #F58013 12.26%, #F19D19 86.52%)',
        gradientBorder: '#F58013',
      }
    default:
      throw new Error(`Not implemented protocol ${protocol}`)
  }
}

export const PortfolioPositionBlock = ({ position }: { position: PortfolioPosition }) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const asset =
    position.primaryToken === position.secondaryToken
      ? position.primaryToken
      : `${position.primaryToken}/${position.secondaryToken}`
  const icons =
    position.primaryToken === position.secondaryToken
      ? [position.primaryToken]
      : [position.primaryToken, position.secondaryToken]

  const dynamicColors = position.availableToMigrate
    ? getColorsPerProtocol(position.protocol)
    : {
        gradientText: 'neutral80',
        gradientBorder: 'neutral20',
      }

  return (
    <AppLink
      href={position.url}
      sx={{
        width: '100%',
        p: 3,
        border: '1px solid transparent',
        background: dynamicColors.gradientBorder,
        borderRadius: 'large',
        transition: 'border-color 200ms',
        '&:hover': {
          // filter: 'blur(6px)',
          '.position-action-button': {
            bg: 'secondary100',
          },
          '.position-app-link': {
            ...getGradientColor(dynamicColors.gradientText),
          },
        },
      }}
    >
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
        <Text className="position-app-link" variant="boldParagraph3" color={'neutral80'}>
          {position.availableToMigrate ? tPortfolio('migrate') : upperFirst(position.type)}
          {position.lendingType && ` - ${tPortfolio(`lending-type.${position.lendingType}`)}`}
        </Text>
        <Flex>
          <ProtocolLabel network={position.network} protocol={position.protocol} />
        </Flex>
      </Flex>
      <AssetsTableDataCellAsset
        asset={asset}
        icons={icons}
        positionId={
          !position.availableToMigrate && !position.description
            ? position.positionId.toString()
            : undefined
        }
        description={
          position.availableToMigrate
            ? `${LendingProtocolLabel[position.protocol]} ${position.type}`
            : position.description
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
          {[OmniProductType.Earn].includes(position.type) && (
            <Flex>
              {position.openDate && (
                <Text variant="boldParagraph3" color="neutral80">
                  {tPortfolio('days-of-earning', {
                    days: dayjs().diff(dayjs.unix(position.openDate), 'day'),
                  })}
                </Text>
              )}
            </Flex>
          )}
          <Flex sx={{ alignSelf: 'flex-end' }}>
            <Button className="position-action-button" variant="tertiary">
              {tPortfolio('view-position')}
            </Button>
          </Flex>
        </Flex>
      )}
      {getLocalAppConfig('features').EnableMigrations && position.availableToMigrate && (
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Flex sx={{ flexDirection: 'column', gap: 2 }}>
            <Text variant="paragraph4" color="neutral80">
              Why migrate?
            </Text>
            <Flex sx={{ flexDirection: ['column', 'row'], gap: 2 }}>
              <Pill>{tPortfolio('migrations.stop-loss')}</Pill>
              <Pill>{tPortfolio('migrations.one-click-multiply')}</Pill>
              <Pill>{tPortfolio('migrations.advanced-automation')}</Pill>
            </Flex>
          </Flex>

          <Button className="position-action-button" variant="tertiary">
            {tPortfolio('migrate')} →
          </Button>
        </Flex>
      )}
    </AppLink>
  )
}
