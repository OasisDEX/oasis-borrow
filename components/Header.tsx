import { Global } from '@emotion/core'
import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { AppLink } from 'components/Links'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import { UserSettings, UserSettingsButtonContents } from 'features/userSettings/UserSettingsView'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { WithChildren } from 'helpers/types'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useOnboarding } from 'helpers/useOnboarding'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { InitOptions } from 'i18next'
import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import React, { useCallback, useState } from 'react'
import { TRANSITIONS } from 'theme'
import { Box, Button, Card, Container, Flex, Grid, Image, SxStyleProp, Text } from 'theme-ui'
import { useOnMobile } from 'theme/useBreakpointIndex'

import { ContextConnected } from '../blockchain/network'
import { LANDING_PILLS } from '../content/landing'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
  SwapWidgetState,
} from '../features/automation/protection/common/UITypes/SwapWidgetChange'
import { useAppContext } from './AppContextProvider'
import { MobileSidePanelPortal, ModalCloseIcon } from './Modal'
import { NotificationsIconButton } from './notifications/NotificationsIconButton'
import { useSharedUI } from './SharedUIProvider'
import { UniswapWidgetShowHide } from './uniswapWidget/UniswapWidget'

export function Logo({ sx }: { sx?: SxStyleProp }) {
  return (
    <AppLink
      withAccountPrefix={false}
      href="/"
      sx={{
        color: 'primary100',
        fontWeight: 'semiBold',
        fontSize: '0px',
        cursor: 'pointer',
        zIndex: 1,
        ...sx,
      }}
    >
      <Image src={staticFilesRuntimeUrl('/static/img/logo.svg')} />
    </AppLink>
  )
}

export function BasicHeader({
  variant,
  children,
  sx,
}: { variant?: string; sx?: SxStyleProp } & WithChildren) {
  return (
    <Box as="header" sx={{ position: 'relative', zIndex: 'menu' }}>
      <Container
        variant={variant}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          p: 3,
          mb: 3,
          minHeight: '83px',
          ...sx,
        }}
      >
        {children}
      </Container>
    </Box>
  )
}

export function BackArrow() {
  return (
    <Box
      sx={{
        cursor: 'pointer',
        color: 'neutral70',
        fontSize: '0',
        transition: TRANSITIONS.global,
        '&:hover': {
          color: 'neutral80',
        },
      }}
    >
      <Icon name="arrow_left" size="auto" width="32" height="47" />
    </Box>
  )
}

function useVaultCount() {
  const { accountData$ } = useAppContext()
  const [accountData] = useObservable(accountData$)

  const count = accountData?.numberOfVaults !== undefined ? accountData.numberOfVaults : undefined

  return count && count > 0 ? count : null
}

function PositionsLink({ sx, children }: { sx?: SxStyleProp } & WithChildren) {
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)
  const { pathname } = useRouter()

  return (
    <AppLink
      variant="links.navHeader"
      sx={{
        color: navLinkColor(pathname.includes('owner')),
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        ...sx,
      }}
      href={`/owner/${(context as ContextConnected)?.account}`}
      onClick={() => trackingEvents.yourVaults()}
    >
      {children}
    </AppLink>
  )
}

function PositionsButton({ sx }: { sx?: SxStyleProp }) {
  const vaultCount = useVaultCount()

  return (
    <PositionsLink sx={{ position: 'relative', ...sx }}>
      <Button
        variant="menuButtonRound"
        sx={{ color: 'neutral80', ':hover': { color: 'primary100' } }}
      >
        <Icon name="home" size="auto" width="20" />
      </Button>
      {vaultCount && (
        <Flex
          sx={{
            position: 'absolute',
            top: '-1px',
            right: '-7px',
            width: '24px',
            height: '24px',
            bg: 'interactive100',
            color: 'neutral10',
            borderRadius: '50%',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 'menu',
          }}
        >
          {vaultCount}
        </Flex>
      )}
    </PositionsLink>
  )
}

function ButtonDropdown({
  ButtonContents,
  round,
  sx,
  dropdownSx,
  showNewBeacon,
  onOpen,
  children,
}: {
  ButtonContents: React.ComponentType<{ active?: boolean; sx?: SxStyleProp }>
  round?: boolean
  sx?: SxStyleProp
  dropdownSx?: SxStyleProp
  showNewBeacon?: boolean
  onOpen?: () => void
} & WithChildren) {
  const [isOpen, setIsOpen] = useState(false)

  const componentRef = useOutsideElementClickHandler(() => setIsOpen(false))

  return (
    <Flex ref={componentRef} sx={{ position: 'relative', ...sx }}>
      <Button
        variant={round ? 'menuButtonRound' : 'menuButton'}
        onClick={() => {
          setIsOpen(!isOpen)
          onOpen && onOpen()
        }}
        sx={{
          position: 'relative',
          p: 1,
          '&, :focus': {
            outline: isOpen ? '1px solid' : null,
            outlineColor: 'primary100',
          },
          color: 'neutral80',
          ':hover': { color: 'primary100' },
        }}
      >
        {showNewBeacon && (
          <Icon
            name="new_beacon"
            sx={{ position: 'absolute', top: '-3px', right: '-3px' }}
            size="auto"
            width={22}
          />
        )}
        <ButtonContents active={isOpen} />
      </Button>
      <Box
        sx={{
          display: isOpen ? 'block' : 'none',
          p: 0,
          position: 'absolute',
          top: 'auto',
          left: 'auto',
          right: 0,
          bottom: 0,
          transform: 'translateY(calc(100% + 10px))',
          bg: 'neutral10',
          boxShadow: 'elevation',
          borderRadius: 'mediumLarge',
          border: 'none',
          overflowX: 'visible',
          zIndex: 0,
          minWidth: 7,
          minHeight: 7,
          ...dropdownSx,
        }}
      >
        {children}
      </Box>
    </Flex>
  )
}

function UserDesktopMenu() {
  const { t } = useTranslation()
  const { accountData$, context$, web3Context$, uiChanges } = useAppContext()
  const [context] = useObservable(context$)
  const [accountData] = useObservable(accountData$)
  const [web3Context] = useObservable(web3Context$)
  const vaultCount = useVaultCount()
  const [exchangeOnboarded] = useOnboarding('Exchange')
  const [exchangeOpened, setExchangeOpened] = useState(false)
  const [widgetUiChanges] = useObservable(
    uiChanges.subscribe<SwapWidgetState>(SWAP_WIDGET_CHANGE_SUBJECT),
  )
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  // TODO: Update this once the the notifications pannel is available
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false)
  const notificationsRef = useOutsideElementClickHandler(() => setNotificationsPanelOpen(false))
  const notificationsToggle = useFeatureToggle('Notifications')

  const widgetOpen = widgetUiChanges && widgetUiChanges.isOpen

  const showNewUniswapWidgetBeacon = !exchangeOnboarded && !exchangeOpened

  const shouldHideSettings =
    !context ||
    context.status === 'connectedReadonly' ||
    !accountData ||
    web3Context?.status !== 'connected'

  return (
    <Flex
      sx={{
        p: 0,
        justifyContent: 'space-between',
        gap: 2,
        zIndex: 3,
      }}
    >
      <Flex
        sx={{
          position: 'relative',
        }}
      >
        <PositionsLink sx={{ mr: 4, display: ['none', 'none', 'flex'] }}>
          <Icon
            name="home"
            size="auto"
            width="20"
            sx={{ mr: [2, 0, 2], position: 'relative', top: '-1px', flexShrink: 0 }}
          />
          {t('my-positions')} {vaultCount && `(${vaultCount})`}
        </PositionsLink>
        <PositionsButton sx={{ mr: 3, display: ['none', 'flex', 'none'] }} />
        <Box>
          <Button
            variant="menuButtonRound"
            onClick={() => {
              setExchangeOpened(true)
              uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
                type: 'open',
              })
            }}
            sx={{
              mr: 2,
              position: 'relative',
              '&, :focus': {
                outline: widgetOpen ? '1px solid' : null,
                outlineColor: 'primary100',
              },
              color: 'neutral80',
              ':hover': { color: 'primary100' },
            }}
          >
            {showNewUniswapWidgetBeacon && (
              <Icon
                name="new_beacon"
                sx={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                }}
                size="auto"
                width={22}
              />
            )}
            <Icon
              name="exchange"
              size="auto"
              width="20"
              color={widgetOpen ? 'primary100' : 'inherit'}
            />
          </Button>
          <UniswapWidgetShowHide />
        </Box>

        {!shouldHideSettings && (
          <ButtonDropdown
            ButtonContents={({ active }) => (
              <UserSettingsButtonContents {...{ context, accountData, web3Context, active }} />
            )}
          >
            <UserSettings sx={{ p: 4, minWidth: '380px' }} />
          </ButtonDropdown>
        )}

        {/* TODO: Should remove feature toggle */}
        {!shouldHideSettings && notificationsToggle && (
          <NotificationsIconButton
            notificationsRef={notificationsRef}
            onButtonClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
            notificationsCount={notificationsState?.numberOfNotifications}
            notificationsPanelOpen={notificationsPanelOpen}
          />
        )}
      </Flex>
    </Flex>
  )
}

function MobileSettings() {
  const { vaultFormToggleTitle, setVaultFormOpened } = useSharedUI()
  const [opened, setOpened] = useState(false)
  const { accountData$, context$, web3Context$ } = useAppContext()
  const [context] = useObservable(context$)
  const [accountData] = useObservable(accountData$)
  const [web3Context] = useObservable(web3Context$)
  const componentRef = useOutsideElementClickHandler(() => setOpened(false))

  if (
    !context ||
    context.status === 'connectedReadonly' ||
    !accountData ||
    web3Context?.status !== 'connected'
  )
    return null

  return (
    <>
      <Flex
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bg: 'rgba(255,255,255,0.9)',
          p: 3,
          justifyContent: 'space-between',
          gap: 2,
          zIndex: 3,
        }}
      >
        <Button
          variant="menuButton"
          onClick={() => setOpened(true)}
          sx={{ p: 1, width: vaultFormToggleTitle ? undefined : '100%', color: 'neutral80' }}
        >
          <UserSettingsButtonContents {...{ context, accountData, web3Context }} />
        </Button>
        {vaultFormToggleTitle && (
          <Button variant="menuButton" sx={{ px: 3 }} onClick={() => setVaultFormOpened(true)}>
            <Box>{vaultFormToggleTitle}</Box>
          </Button>
        )}
      </Flex>
      <MobileSidePanelPortal>
        <Box
          sx={{
            display: 'block',
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            transition: '0.3s transform ease-in-out',
            transform: `translateY(${opened ? '0' : '100'}%)`,
            bg: 'neutral10',
            p: 3,
            pt: 0,
            zIndex: 'modal',
            boxShadow: 'bottomSheet',
            borderTopLeftRadius: 'large',
            borderTopRightRadius: 'large',
          }}
          ref={componentRef}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              pt: 2,
            }}
          >
            <ModalCloseIcon
              close={() => setOpened(false)}
              sx={{ top: 0, right: 0, color: 'primary100', position: 'relative' }}
              size={3}
            />
          </Box>
          <Card variant="vaultFormContainer" sx={{ p: 2 }}>
            <UserSettings />
          </Card>
        </Box>
      </MobileSidePanelPortal>
    </>
  )
}

function navLinkColor(isActive: boolean) {
  return isActive ? 'primary100' : 'neutral80'
}

const LINKS = {
  'dai-wallet': `${getConfig().publicRuntimeConfig.apiHost}/daiwallet`,
  learn: 'https://kb.oasis.app',
  blog: 'https://blog.oasis.app',
  multiply: `/multiply`,
  borrow: `/borrow`,
  earn: '/earn',
}

function ConnectedHeader() {
  const { uiChanges } = useAppContext()
  const { pathname } = useRouter()
  const { t } = useTranslation()
  const onMobile = useOnMobile()
  const [widgetUiChanges] = useObservable(
    uiChanges.subscribe<SwapWidgetState>(SWAP_WIDGET_CHANGE_SUBJECT),
  )
  // socket instance that can be used to emit events
  // const { socket } = useSocket()

  const widgetOpen = widgetUiChanges && widgetUiChanges.isOpen

  return (
    <React.Fragment>
      {!onMobile ? (
        <BasicHeader
          sx={{
            position: 'relative',
            alignItems: 'center',
            zIndex: 1,
          }}
          variant="appContainer"
        >
          <>
            <Flex
              sx={{
                alignItems: 'center',
                justifyContent: ['space-between', 'flex-start'],
                width: ['100%', 'auto'],
              }}
            >
              <Logo />
              <Flex sx={{ ml: 5, zIndex: 1 }}>
                <AppLink
                  variant="links.navHeader"
                  href={LINKS.multiply}
                  sx={{
                    mr: 4,
                    color: navLinkColor(pathname.includes(LINKS.multiply)),
                  }}
                >
                  {t('nav.multiply')}
                </AppLink>
                <AppLink
                  variant="links.navHeader"
                  href={LINKS.borrow}
                  sx={{ mr: 4, color: navLinkColor(pathname.includes(LINKS.borrow)) }}
                >
                  {t('nav.borrow')}
                </AppLink>
                <AppLink
                  variant="links.navHeader"
                  href={LINKS.earn}
                  sx={{ mr: 4, color: navLinkColor(pathname.includes(LINKS.earn)) }}
                >
                  {t('nav.earn')}
                </AppLink>
                <AssetsDropdown />
              </Flex>
            </Flex>
            <UserDesktopMenu />
          </>
        </BasicHeader>
      ) : (
        // Mobile header
        <Box sx={{ mb: 5 }}>
          <BasicHeader variant="appContainer">
            <Flex sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <Logo />
            </Flex>
            <Flex sx={{ flexShrink: 0 }}>
              <PositionsButton sx={{ mr: 2 }} />
              <Button
                variant="menuButtonRound"
                onClick={() => {
                  uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
                    type: 'open',
                  })
                }}
                sx={{
                  mr: 2,
                  '&, :focus': {
                    outline: widgetOpen ? '1px solid' : null,
                    outlineColor: 'primary100',
                  },
                  color: 'neutral80',
                  ':hover': { color: 'primary100' },
                }}
              >
                <Icon
                  name="exchange"
                  size="auto"
                  width="20"
                  color={widgetOpen ? 'primary100' : 'inherit'}
                />
              </Button>
              <UniswapWidgetShowHide
                sxWrapper={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  right: 'unset',
                  bottom: 'unset',
                  transform: 'translateX(-50%) translateY(-50%)',
                }}
              />
              <MobileMenu />
            </Flex>
            <MobileSettings />
          </BasicHeader>
        </Box>
      )}
    </React.Fragment>
  )
}

function HeaderDropdown({
  title,
  sx,
  children,
}: { title: string; sx?: SxStyleProp } & WithChildren) {
  return (
    <Box
      sx={{
        display: 'flex',
        position: 'relative',
        '& .menu': { display: 'none' },
        '&:hover': {
          '& .trigger': {
            color: 'primary100',
          },
          '& .menu': {
            display: 'block',
          },
        },
        ...sx,
      }}
    >
      <Box className="trigger" variant="links.navHeader" sx={{ whiteSpace: 'nowrap' }}>
        {title} <Icon name="caret_down" size="7.75px" sx={{ ml: '3px' }} />
      </Box>
      <Box className="menu" sx={{ position: 'absolute', top: '100%', pt: 2 }}>
        <Card
          sx={{
            borderRadius: 'medium',
            width: 'max-content',
            pl: 3,
            pr: 3,
            py: 3,
            boxShadow: 'cardLanding',
            border: 'none',
            display: 'grid',
            rowGap: 2,
            '& > *': {
              py: 2,
            },
          }}
        >
          {children}
        </Card>
      </Box>
    </Box>
  )
}

function AssetsDropdown() {
  const { t } = useTranslation()
  return (
    <HeaderDropdown title={t('nav.assets')}>
      <Grid
        columns="minmax(50px, auto) minmax(50px, auto)"
        sx={{ columnGap: '48px', rowGap: '24px' }}
      >
        {LANDING_PILLS.map((asset) => (
          <AppLink
            href={asset.link}
            key={asset.label}
            sx={{ display: 'flex', alignItems: 'center', fontWeight: 'body', fontSize: 3 }}
            variant="links.nav"
          >
            <Icon name={asset.icon} size={32} sx={{ mr: 2 }} />
            <Text>{asset.label}</Text>
          </AppLink>
        ))}
      </Grid>
    </HeaderDropdown>
  )
}

function LanguageDropdown({ sx }: { sx?: SxStyleProp }) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { locales } = i18n.options as InitOptions & { locales: string[] }

  return (
    <HeaderDropdown title={t(`lang-dropdown.${i18n.language}`)} sx={sx}>
      {locales
        .filter((lang) => lang !== i18n.language)
        .map((lang, index) => (
          <Text
            key={index}
            variant="links.nav"
            sx={{ fontWeight: 'body' }}
            onClick={() => router.push(router.asPath, router.asPath, { locale: lang })}
          >
            {t(`lang-dropdown.${lang}`)}
          </Text>
        ))}
    </HeaderDropdown>
  )
}

function MobileMenuLink({ isActive, children }: { isActive: boolean } & WithChildren) {
  return (
    <Box
      sx={{
        ':hover': { bg: 'neutral30' },
        borderRadius: 'medium',
        p: 3,
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', color: navLinkColor(isActive) }}>
        {children}
      </Text>
    </Box>
  )
}

export function MobileMenu() {
  const { t } = useTranslation()
  const { pathname } = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showAssets, setShowAssets] = useState(false)

  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false)
  const notificationsRef = useOutsideElementClickHandler(() => setNotificationsPanelOpen(false))
  const notificationsToggle = useFeatureToggle('Notifications')
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  const links = [
    { labelKey: 'nav.multiply', url: LINKS.multiply },
    { labelKey: 'nav.borrow', url: LINKS.borrow },
    { labelKey: 'nav.earn', url: LINKS.earn },
  ]

  const closeMenu = useCallback(() => setIsOpen(false), [])

  return (
    <>
      {isOpen && (
        <Global
          styles={() => ({
            body: {
              position: 'fixed',
              width: '100vw',
            },
          })}
        />
      )}
      <Box
        sx={{
          backgroundColor: 'neutral10',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 'mobileMenu',
          transition: 'opacity ease-in 0.25s',
          height: '100%',
          overflowY: 'auto',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'unset' : 'none',
          p: 4,
        }}
      >
        <Grid sx={{ rowGap: 0, mt: 3, display: showAssets ? 'none' : 'grid' }}>
          {links.map((link) => (
            <AppLink key={link.labelKey} href={link.url} onClick={closeMenu}>
              <MobileMenuLink isActive={pathname.includes(link.url)}>
                {t(link.labelKey)}
              </MobileMenuLink>
            </AppLink>
          ))}
          <Box onClick={() => setShowAssets(true)}>
            <MobileMenuLink isActive={false}>
              <Flex sx={{ alignItems: 'center' }}>
                {t('nav.assets')} <Icon name="chevron_right" sx={{ ml: 1 }} />
              </Flex>
            </MobileMenuLink>
          </Box>
        </Grid>
        <Grid sx={{ rowGap: 4, mt: 3, display: showAssets ? 'grid' : 'none' }}>
          <Box onClick={() => setShowAssets(false)} sx={{ justifySelf: 'flex-start' }}>
            <MobileMenuLink isActive={false}>
              <Flex sx={{ alignItems: 'center' }}>
                <Icon name="chevron_left" sx={{ mr: 1 }} /> {t('nav.assets')}
              </Flex>
            </MobileMenuLink>
          </Box>
          <Grid sx={{ rowGap: 0 }}>
            {LANDING_PILLS.map((asset) => (
              <AppLink key={asset.label} href={asset.link}>
                <MobileMenuLink isActive={false}>
                  <Flex sx={{ alignItems: 'center' }}>
                    <Icon name={asset.icon} size="auto" width="27" sx={{ flexShrink: 0, mr: 1 }} />{' '}
                    {asset.label}
                  </Flex>
                </MobileMenuLink>
              </AppLink>
            ))}
          </Grid>
        </Grid>
        <Box
          sx={{
            color: 'neutral80',
            ':hover': { color: 'primary100' },
            position: 'absolute',
            bottom: 5,
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
          }}
          onClick={() => setIsOpen(false)}
        >
          <Icon name="mobile_menu_close" size="auto" width="50" />
        </Box>
      </Box>
      {notificationsToggle && (
        <NotificationsIconButton
          notificationsRef={notificationsRef}
          onButtonClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
          notificationsCount={notificationsState?.numberOfNotifications}
          notificationsPanelOpen={notificationsPanelOpen}
        />
      )}
      <Button variant="menuButtonRound">
        <Icon
          name={'menu'}
          onClick={() => setIsOpen(true)}
          size="auto"
          width="20px"
          color="neutral80"
        />
      </Button>
    </>
  )
}

function DisconnectedHeader() {
  const { t } = useTranslation()
  const { pathname } = useRouter()

  return (
    <>
      <Box sx={{ display: ['none', 'block'] }}>
        <BasicHeader variant="appContainer">
          <Grid sx={{ alignItems: 'center', columnGap: [4, 4, 5], gridAutoFlow: 'column', mr: 3 }}>
            <Logo />
            <AppLink
              variant="links.navHeader"
              href={LINKS.multiply}
              sx={{ color: navLinkColor(pathname.includes(LINKS.multiply)) }}
            >
              {t('nav.multiply')}
            </AppLink>
            <AppLink
              variant="links.navHeader"
              href={LINKS.borrow}
              sx={{ color: navLinkColor(pathname.includes(LINKS.borrow)) }}
            >
              {t('nav.borrow')}
            </AppLink>
            <AppLink
              variant="links.navHeader"
              href={LINKS.earn}
              sx={{ color: navLinkColor(pathname.includes(LINKS.earn)) }}
            >
              {t('nav.earn')}
            </AppLink>
            <AssetsDropdown />
          </Grid>
          <Grid sx={{ alignItems: 'center', columnGap: 3, gridAutoFlow: 'column' }}>
            <AppLink
              variant="buttons.secondary"
              href="/connect"
              sx={{
                boxShadow: 'cardLanding',
                bg: 'neutral10',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                '&:hover svg': {
                  transform: 'translateX(8px)',
                },
                flexShrink: 0,
              }}
            >
              <Text variant="strong">{t('connect-wallet-button')}</Text>
              <Icon
                name="arrow_right"
                size="15px"
                sx={{ position: 'relative', left: '6px', transition: '0.2s' }}
              />
            </AppLink>
            <LanguageDropdown
              sx={{ '@media (max-width: 1330px)': { '.menu': { right: '-6px' } } }}
            />
          </Grid>
        </BasicHeader>
      </Box>
      <Box sx={{ display: ['block', 'none'], mb: 5 }}>
        <BasicHeader variant="appContainer">
          <Logo />
          <MobileMenu />
        </BasicHeader>
      </Box>
    </>
  )
}

export function AppHeader() {
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)

  return context?.status === 'connected' ? <ConnectedHeader /> : <DisconnectedHeader />
}

export function ConnectPageHeader() {
  return (
    <BasicHeader>
      <Logo />
    </BasicHeader>
  )
}
