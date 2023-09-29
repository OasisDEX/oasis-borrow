import type {
  NavigationMenuPanelListItem,
  NavigationMenuPanelType,
} from 'components/navigation/Navigation.types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { getLocalAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { Trans } from 'next-i18next'
import React from 'react'
import type { TranslationType } from 'ts_modules/i18next'
import type { AppConfigType } from 'types/config'

const { AjnaSafetySwitch } = getLocalAppConfig('features')

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
                description: navigation.protocols.aave.borrow.description,
                url: `${INTERNAL_LINKS.borrow}`,
              },
              {
                title: t('nav.multiply'),
                description: navigation.protocols.aave.multiply.description,
                url: `${INTERNAL_LINKS.multiply}`,
              },
              {
                title: t('nav.earn'),
                description: navigation.protocols.aave.earn.description,
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
              // TODO filter by protocol
              url: `${INTERNAL_LINKS.borrow}`,
            },
          },
        },
        ...(AjnaSafetySwitch
          ? []
          : ([
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
                      description: navigation.protocols.ajna.borrow.description,
                      url: `${INTERNAL_LINKS.borrow}`,
                    },
                    {
                      title: t('nav.multiply'),
                      description: navigation.protocols.ajna.multiply.description,
                      url: `${INTERNAL_LINKS.multiply}`,
                    },
                    {
                      title: t('nav.earn'),
                      description: navigation.protocols.ajna.earn.description,
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
                    // TODO filter by protocol
                    url: `${INTERNAL_LINKS.borrow}`,
                  },
                },
              },
            ] as NavigationMenuPanelListItem[])),
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
                description: navigation.protocols.maker.borrow.description,
                url: `${INTERNAL_LINKS.borrow}`,
              },
              {
                title: t('nav.multiply'),
                description: navigation.protocols.maker.multiply.description,
                url: `${INTERNAL_LINKS.multiply}`,
              },
              {
                title: t('nav.earn'),
                description: navigation.protocols.maker.earn.description,
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
              // TODO filter by protocol
              url: `${INTERNAL_LINKS.borrow}`,
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
                description: navigation.protocols.spark.borrow.description,
                url: `${INTERNAL_LINKS.borrow}`,
              },
              {
                title: t('nav.multiply'),
                description: navigation.protocols.spark.multiply.description,
                url: `${INTERNAL_LINKS.multiply}`,
              },
              {
                title: t('nav.earn'),
                description: navigation.protocols.spark.earn.description,
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
              // TODO filter by protocol
              url: `${INTERNAL_LINKS.borrow}`,
            },
          },
        },
      ],
    },
  ],
})
