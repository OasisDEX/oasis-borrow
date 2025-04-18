import BigNumber from 'bignumber.js'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AppLink } from 'components/Links'
import { Pill } from 'components/Pill'
import { emptyPortfolioPositionNetValueThreshold } from 'components/portfolio/constants'
import { PortfolioPositionAutomationIcons } from 'components/portfolio/positions/PortfolioPositionAutomationIcons'
import { PortfolioPositionBlockDetail } from 'components/portfolio/positions/PortfolioPositionBlockDetail'
import { ProtocolLabel } from 'components/ProtocolLabel'
import dayjs from 'dayjs'
import { isRefinanceSupportedNetwork } from 'features/aave/helpers/isRefinanceSupportedNetwork'
import { LazySummerPorfolioPositionBanner } from 'features/lazy-summer/components/LazySummerPorfolioPositionBanner'
import { shouldShowPairId } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { RefinancePortfolioBanner } from 'features/refinance/components'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { getLocalAppConfig, useAppConfig } from 'helpers/config'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { getGradientColor } from 'helpers/getGradientColor'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Button, Flex, Text } from 'theme-ui'

const getMigrationGradientsPerProtocol = (
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
        gradientBorder:
          'linear-gradient(white 0 0) padding-box, linear-gradient(159.01deg, #F58013 12.26%, #F19D19 86.52%) border-box',
      }

    default:
      console.error(`Not implemented protocol ${protocol}`)
      return {
        gradientText: 'neutral80',
        gradientBorder: 'neutral20',
      }
  }
}

export const PortfolioPositionBlock = ({ position }: { position: PortfolioPosition }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const {
    EnableRefinance: isRefinanceEnabled,
    Rays: isRaysEnabled,
    SkyUpgrade,
  } = useAppConfig('features')

  const resolvedPairId = shouldShowPairId({
    collateralToken: position.primaryToken,
    networkName: position.network,
    protocol: position.protocol,
    quoteToken: position.secondaryToken,
  })
    ? `-${position.pairId}`
    : ''

  const asset =
    position?.assetLabel ??
    (position.primaryToken === position.secondaryToken
      ? position.primaryToken
      : `${position.primaryToken}/${position.secondaryToken}${resolvedPairId}`)
  const icons =
    position.primaryToken === position.secondaryToken
      ? [position.primaryToken]
      : [position.primaryToken, position.secondaryToken]

  const migrationPositionStyles = position.availableToMigrate
    ? {
        borderColor: 'transparent',
        boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.15)',
        background: getMigrationGradientsPerProtocol(position.protocol).gradientBorder,
        '.position-app-link': {
          ...getGradientColor(getMigrationGradientsPerProtocol(position.protocol).gradientText),
        },
      }
    : {}

  const showSkyBanner =
    SkyUpgrade &&
    (position.protocol === LendingProtocol.Maker ||
      [position.primaryToken, position.secondaryToken].includes('DAI') ||
      [position.primaryToken, position.secondaryToken].includes('MKR'))

  return (
    <>
      {showSkyBanner && (
        <AppLink
          href={INTERNAL_LINKS.skySwapPage}
          sx={{
            zIndex: 0,
          }}
        >
          <Flex
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: '-60px',
              p: 3,
              pb: '50px',
              backgroundImage: `url(${staticFilesRuntimeUrl('/static/img/sky-banner-background.png')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'bottom',
              border: '1px solid transparent',
              borderColor: 'neutral20',
              borderRadius: 'large',
            }}
          >
            <Text color="neutral10">The Sky Ecosystem is here</Text>{' '}
            <Button variant="outlineSmall" color="neutral10">
              Upgrade DAI & MKR now
            </Button>
          </Flex>
        </AppLink>
      )}
      <Box
        sx={{
          width: '100%',
          p: 3,
          border: '1px solid transparent',
          borderColor: position.lazySummerBestApy ? 'rgba(255, 73, 164, 0.5)' : 'neutral20',
          borderRadius: 'large',
          transition: 'border-color 200ms, box-shadow 200ms, background 200ms',
          backgroundColor: 'neutral10',
          zIndex: 1,
          '&:hover': {
            borderColor: 'neutral70',
            '.position-action-button': {
              bg: 'secondary100',
            },
            ...migrationPositionStyles,
          },
        }}
      >
        {isRefinanceEnabled &&
          isRefinanceSupportedNetwork(position.network) &&
          position.availableToRefinance &&
          position.netValue >= emptyPortfolioPositionNetValueThreshold && (
            <RefinancePortfolioBanner position={position} />
          )}
        {position.lazySummerBestApy && <LazySummerPorfolioPositionBanner position={position} />}
        <AppLink href={position.url}>
          <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
            <Text
              className="position-app-link heading-with-effect"
              variant="boldParagraph3"
              color={'neutral80'}
              sx={{
                '&::after': {
                  content: 'attr(data-value)',
                  position: 'absolute',
                  top: '0px',
                  left: '0px',
                  opacity: 0,
                  transition: 'opacity 600ms ease 0s',
                  backgroundClip: 'text',
                  backgroundImage:
                    'linear-gradient(90deg, rgb(24, 89, 242) 0%, rgb(0, 55, 138) 100%)',
                },
              }}
            >
              {position.availableToMigrate ? tPortfolio('migrate') : upperFirst(position.type)}
              {position.lendingType && ` - ${tPortfolio(`lending-type.${position.lendingType}`)}`}
            </Text>
            <Flex
              sx={{
                columnGap: 3,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              {!!position.raysPerYear && isRaysEnabled && (
                <Text
                  variant="paragraph3"
                  sx={{
                    fontWeight: 'semiBold',
                    ...getGradientColor(
                      'linear-gradient(270.13deg, #007DA3 0.02%, #E7A77F 56.92%, #E97047 98.44%)',
                    ),
                    maxWidth: '200px',
                  }}
                >
                  {typeof position.raysPerYear.value === 'string' ? (
                    position.raysPerYear.link ? (
                      <Button
                        variant="unStyled"
                        sx={{ fontWeight: 'semiBold' }}
                        onClick={() => window.open(position.raysPerYear?.link, '_ blank')}
                      >
                        {position.raysPerYear.value}
                      </Button>
                    ) : (
                      position.raysPerYear.value
                    )
                  ) : (
                    <>
                      + {formatCryptoBalance(new BigNumber(position.raysPerYear.value))} Rays / year
                    </>
                  )}
                </Text>
              )}
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
                ? `${LendingProtocolLabel[position.protocol]} ${position.type ?? ''}`
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
            <Flex
              sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              {[OmniProductType.Borrow, OmniProductType.Multiply].includes(position.type!) && (
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
              {[OmniProductType.Earn].includes(position.type!) && (
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
            <Flex
              sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
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
      </Box>
    </>
  )
}
