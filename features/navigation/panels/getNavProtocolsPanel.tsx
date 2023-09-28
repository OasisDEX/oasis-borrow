import type { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { Trans } from 'next-i18next'
import React from 'react'
import type { TranslationType } from 'ts_modules/i18next'
import type { AppConfigType } from 'types/config'

export const getNavProtocolsPanel = ({
  t,
  navigation,
}: {
  t: TranslationType
  navigation: AppConfigType['navigation']
}): NavigationMenuPanelType => ({
  label: t('nav.protocols'),
  lists: [
    {
      items: [
        {
          title: 'Aave',
          icon: {
            image: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
            position: 'title',
          },
          hoverColor: lendingProtocolsByName[LendingProtocol.AaveV3].gradient,
          description: t('nav.protocols-aave'),
          list: {
            items: [
              {
                title: t('nav.borrow'),
                description: t('nav.borrow-against', {
                  tokens: navigation.protocols.aave.borrow.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.borrow}`,
              },
              {
                title: t('nav.multiply'),
                description: t('nav.increase-exposure', {
                  tokens: navigation.protocols.aave.multiply.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.multiply}`,
              },
              {
                title: t('nav.earn'),
                description: t('nav.earn-yield', {
                  tokens: navigation.protocols.aave.earn.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.earn}`,
              },
              {
                title: navigation.protocols.aave.extra.title,
                promoted: true,
                description: navigation.protocols.aave.extra.description,
                url: navigation.protocols.aave.extra.url,
              },
            ],
            link: {
              label: t('nav.protocols-more', { protocol: 'Aave' }),
              url: '/',
            },
          },
        },
        {
          title: 'Ajna',
          icon: {
            image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
            position: 'title',
          },
          hoverColor: lendingProtocolsByName[LendingProtocol.Ajna].gradient,
          description: <Trans i18nKey="nav.protocols-ajna" components={{ br: <br /> }} />,
          list: {
            items: [
              {
                title: t('nav.borrow'),
                description: t('nav.borrow-against', {
                  tokens: navigation.protocols.ajna.borrow.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.borrow}`,
              },
              {
                title: t('nav.multiply'),
                description: t('nav.increase-exposure', {
                  tokens: navigation.protocols.ajna.multiply.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.multiply}`,
              },
              {
                title: t('nav.earn'),
                description: t('nav.earn-yield', {
                  tokens: navigation.protocols.ajna.earn.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.earn}`,
              },
              {
                title: navigation.protocols.ajna.extra.title,
                promoted: true,
                description: navigation.protocols.ajna.extra.description,
                url: navigation.protocols.ajna.extra.url,
              },
            ],
            link: {
              label: t('nav.protocols-more', { protocol: 'Ajna' }),
              url: '/',
            },
          },
        },
        {
          title: 'Maker',
          icon: {
            image: lendingProtocolsByName[LendingProtocol.Maker].icon,
            position: 'title',
          },
          hoverColor: lendingProtocolsByName[LendingProtocol.Maker].gradient,
          description: <Trans i18nKey="nav.protocols-maker" components={{ br: <br /> }} />,
          list: {
            items: [
              {
                title: t('nav.borrow'),
                description: t('nav.borrow-against', {
                  tokens: navigation.protocols.maker.borrow.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.borrow}`,
              },
              {
                title: t('nav.multiply'),
                description: t('nav.increase-exposure', {
                  tokens: navigation.protocols.maker.multiply.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.multiply}`,
              },
              {
                title: t('nav.earn'),
                description: t('nav.earn-yield', {
                  tokens: navigation.protocols.maker.earn.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.earn}`,
              },
              {
                title: navigation.protocols.maker.extra.title,
                promoted: true,
                description: navigation.protocols.maker.extra.description,
                url: navigation.protocols.maker.extra.url,
              },
            ],
            link: {
              label: t('nav.protocols-more', { protocol: 'Maker' }),
              url: '/',
            },
          },
        },
        {
          title: 'Spark',
          icon: {
            image: lendingProtocolsByName[LendingProtocol.SparkV3].icon,
            position: 'title',
          },
          hoverColor: lendingProtocolsByName[LendingProtocol.SparkV3].gradient,
          description: <Trans i18nKey="nav.protocols-spark" components={{ br: <br /> }} />,
          list: {
            items: [
              {
                title: t('nav.borrow'),
                description: t('nav.borrow-against', {
                  tokens: navigation.protocols.spark.borrow.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.borrow}`,
              },
              {
                title: t('nav.multiply'),
                description: t('nav.increase-exposure', {
                  tokens: navigation.protocols.spark.multiply.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.multiply}`,
              },
              {
                title: t('nav.earn'),
                description: t('nav.earn-yield', {
                  tokens: navigation.protocols.spark.earn.tokens.join(', '),
                }),
                url: `${INTERNAL_LINKS.earn}`,
              },
              {
                title: navigation.protocols.spark.extra.title,
                promoted: true,
                description: navigation.protocols.spark.extra.description,
                url: navigation.protocols.spark.extra.url,
              },
            ],
            link: {
              label: t('nav.protocols-more', { protocol: 'Spark' }),
              url: '/',
            },
          },
        },
      ],
    },
  ],
})
