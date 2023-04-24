import { Global } from '@emotion/core'
import { Icon } from '@makerdao/dai-ui-icons'
import { getMixpanelUserContext, trackingEvents } from 'analytics/analytics'
import { ContextConnected } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { WalletPanelMobile } from 'components/navigation/content/WalletPanelMobile'
import { LANDING_PILLS } from 'content/landing'
import { getUnreadNotificationCount } from 'features/notifications/helpers'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
  SwapWidgetState,
} from 'features/uniswapWidget/SwapWidgetChange'
import { UserSettings, UserSettingsButtonContents } from 'features/userSettings/UserSettingsView'
import { ConnectButton } from 'features/web3OnBoard'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { ContextAccountDetails, getShowHeaderSettings } from 'helpers/functions'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { WithChildren } from 'helpers/types'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useOnboarding } from 'helpers/useOnboarding'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import { Box, Button, Card, Container, Flex, Grid, Image, SxStyleProp, Text } from 'theme-ui'
import { useOnMobile } from 'theme/useBreakpointIndex'

import { useAppContext } from './AppContextProvider'
import { NavigationPickNetwork } from './navigation/NavigationPickNetwork'
import { NotificationsIconButton } from './notifications/NotificationsIconButton'
import { UniswapWidgetShowHide } from './uniswapWidget/UniswapWidgetShowHide'

function Logo({ sx }: { sx?: SxStyleProp }) {
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
        height: '22px',
        ...sx,
      }}
    >
      <Image src={staticFilesRuntimeUrl('/static/img/logo_v2.svg')} />
    </AppLink>
  )
}

function BasicHeader({
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
  const { amountOfPositions } = useAccount()

  return (
    <PositionsLink sx={{ position: 'relative', ...sx }}>
      <Button
        variant="menuButtonRound"
        sx={{ color: 'neutral80', ':hover': { color: 'primary100' } }}
      >
        <Icon name="home" size="auto" width="20" />
      </Button>
      {!!amountOfPositions && (
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
          {amountOfPositions}
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
  const { accountData$, context$, uiChanges } = useAppContext()
  const [context] = useObservable(context$)
  const [accountData] = useObservable(accountData$)
  const { amountOfPositions } = useAccount()
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
  const useNetworkSwitcher = useFeatureToggle('UseNetworkSwitcher')

  const widgetOpen = widgetUiChanges && widgetUiChanges.isOpen

  const showNewUniswapWidgetBeacon = !exchangeOnboarded && !exchangeOpened

  const contextAccountDetails: ContextAccountDetails = { context, accountData }

  const showHeaderSettings = getShowHeaderSettings(contextAccountDetails)

  const unreadNotificationCount = getUnreadNotificationCount(notificationsState?.allNotifications)

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
          {t('my-positions')} {!!amountOfPositions && `(${amountOfPositions})`}
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
        {useNetworkSwitcher ? <NavigationPickNetwork /> : null}

        {showHeaderSettings && (
          <ButtonDropdown
            ButtonContents={({ active }) => (
              <UserSettingsButtonContents
                context={contextAccountDetails.context}
                accountData={contextAccountDetails.accountData}
                active={active}
              />
            )}
          >
            <UserSettings sx={{ p: 4, minWidth: '380px' }} />
          </ButtonDropdown>
        )}

        {/* TODO: Should remove feature toggle */}
        {showHeaderSettings && notificationsToggle && (
          <NotificationsIconButton
            notificationsRef={notificationsRef}
            onButtonClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
            notificationsCount={unreadNotificationCount}
            notificationsPanelOpen={notificationsPanelOpen}
            disabled={!notificationsState}
          />
        )}
      </Flex>
    </Flex>
  )
}

function navLinkColor(isActive: boolean) {
  return isActive ? 'primary100' : 'neutral80'
}

function ConnectedHeader() {
  const { uiChanges } = useAppContext()
  const onMobile = useOnMobile()

  const [widgetUiChanges] = useObservable(
    uiChanges.subscribe<SwapWidgetState>(SWAP_WIDGET_CHANGE_SUBJECT),
  )

  const widgetOpen = widgetUiChanges && widgetUiChanges.isOpen

  return (
    <>
      {!onMobile ? (
        <BasicHeader
          sx={{
            position: 'relative',
            alignItems: 'center',
            zIndex: 1,
          }}
          variant="appContainer"
        >
          <MainNavigation />
          <UserDesktopMenu />
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
            <WalletPanelMobile />
          </BasicHeader>
        </Box>
      )}
    </>
  )
}

function HeaderLink({
  label,
  link,
  children,
  onClick,
}: { label: string; link?: string; onClick?: () => void } & WithChildren) {
  const { asPath } = useRouter()
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false)
  const isActive = link ? asPath.includes(link) : false
  const itemSx: SxStyleProp = {
    position: 'relative',
    display: 'block',
    fontSize: 2,
    pr: children ? 3 : 0,
    color: isMouseOver || isActive ? 'primary100' : 'neutral80',
    fontWeight: 'semiBold',
    cursor: 'pointer',
    transition: '200ms color',
  }

  return (
    <Box
      as="li"
      sx={{ position: 'relative' }}
      onMouseEnter={() => {
        setIsMouseOver(true)
      }}
      onMouseLeave={() => {
        setIsMouseOver(false)
      }}
    >
      {link ? (
        <AppLink href={link} sx={itemSx} onClick={onClick}>
          {label}
        </AppLink>
      ) : (
        <>
          <Text as="span" sx={itemSx}>
            {label}
            {children && (
              <Icon
                name="caret_down"
                size="8px"
                sx={{ position: 'absolute', top: '7px', right: 0 }}
              />
            )}
          </Text>
          {children && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: '-12px',
                pt: '12px',
                opacity: isMouseOver ? 1 : 0,
                transform: isMouseOver ? 'translateY(0)' : 'translateY(-5px)',
                pointerEvents: isMouseOver ? 'auto' : 'none',
                transition: 'opacity 200ms, transform 200ms',
              }}
            >
              <Box
                sx={{
                  p: '24px',
                  backgroundColor: 'neutral10',
                  borderRadius: 'large',
                  boxShadow: 'buttonMenu',
                }}
              >
                {children}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

function HeaderList({
  links,
  columns,
}: {
  links: { label: string; link: string; icon?: string }[]
  columns?: number
}) {
  const { asPath } = useRouter()

  return (
    <Box
      as="ul"
      sx={{ p: 0, listStyle: 'none', ...(columns && { columnCount: columns, columnGap: '24px' }) }}
    >
      {links.map(({ label, link, icon }, i) => (
        <Box key={i} as="li" sx={{ mt: i > 0 ? '24px' : 0 }}>
          <AppLink
            href={link}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: asPath.includes(link) ? 'primary100' : 'neutral80',
              fontSize: 3,
              fontWeight: 'regular',
              transition: '200ms color',
              '&:hover': {
                color: 'primary100',
              },
            }}
          >
            {icon && <Icon name={icon} size={32} sx={{ mr: 2 }} />}
            <Text as="span" sx={{ whiteSpace: 'pre' }}>
              {label}
            </Text>
          </AppLink>
        </Box>
      ))}
    </Box>
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
            sx={{ display: 'flex', alignItems: 'center', fontWeight: 'regular', fontSize: 3 }}
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
  const { locales } = i18n.options

  return (
    <HeaderDropdown title={t(`lang-dropdown.${i18n.language}`)} sx={sx}>
      {(locales as string[])
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

function MobileMenu() {
  const { t } = useTranslation()
  const { pathname } = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showAssets, setShowAssets] = useState(false)
  const { accountData$, context$ } = useAppContext()
  const [context] = useObservable(context$)
  const [accountData] = useObservable(accountData$)

  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false)
  const notificationsRef = useOutsideElementClickHandler(() => setNotificationsPanelOpen(false))
  const notificationsToggle = useFeatureToggle('Notifications')
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  const contextAccountDetails: ContextAccountDetails = { context, accountData }
  const showHeaderSettings = getShowHeaderSettings(contextAccountDetails)

  const links = [
    { labelKey: 'nav.multiply', url: INTERNAL_LINKS.multiply },
    { labelKey: 'nav.borrow', url: INTERNAL_LINKS.borrow },
    { labelKey: 'nav.earn', url: INTERNAL_LINKS.earn },
    { labelKey: 'nav.discover', url: INTERNAL_LINKS.discover },
  ]

  const closeMenu = useCallback(() => setIsOpen(false), [])

  const unreadNotificationCount = getUnreadNotificationCount(notificationsState?.allNotifications)

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
      {showHeaderSettings && notificationsToggle && (
        <NotificationsIconButton
          notificationsRef={notificationsRef}
          onButtonClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
          notificationsCount={unreadNotificationCount}
          notificationsPanelOpen={notificationsPanelOpen}
          disabled={!notificationsState}
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
  const useNetworkSwitcher = useFeatureToggle('UseNetworkSwitcher')
  return (
    <>
      <Box sx={{ display: ['none', 'block'] }}>
        <BasicHeader variant="appContainer">
          <MainNavigation />
          <Grid sx={{ alignItems: 'center', columnGap: 3, gridAutoFlow: 'column' }}>
            {useNetworkSwitcher ? <NavigationPickNetwork /> : null}
            <ConnectButton />
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

function MainNavigation() {
  const { i18n, t } = useTranslation()
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)
  const { pathname } = useRouter()

  const discoverOasisEnabled = useFeatureToggle('DiscoverOasis')
  const userContext = getMixpanelUserContext(i18n.language, context)

  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: ['space-between', 'flex-start'],
        width: ['100%', 'auto'],
      }}
    >
      <Logo />
      {!discoverOasisEnabled ? (
        <Flex sx={{ ml: 5, zIndex: 1 }}>
          <AppLink
            variant="links.navHeader"
            href={INTERNAL_LINKS.multiply}
            sx={{
              mr: 4,
              color: navLinkColor(pathname.includes(INTERNAL_LINKS.multiply)),
            }}
          >
            {t('nav.multiply')}
          </AppLink>
          <AppLink
            variant="links.navHeader"
            href={INTERNAL_LINKS.borrow}
            sx={{ mr: 4, color: navLinkColor(pathname.includes(INTERNAL_LINKS.borrow)) }}
          >
            {t('nav.borrow')}
          </AppLink>
          <AppLink
            variant="links.navHeader"
            href={INTERNAL_LINKS.earn}
            sx={{ mr: 4, color: navLinkColor(pathname.includes(INTERNAL_LINKS.earn)) }}
          >
            {t('nav.earn')}
          </AppLink>
          <AssetsDropdown />
        </Flex>
      ) : (
        <Grid
          as="ul"
          sx={{
            gridAutoFlow: 'column',
            columnGap: ['24px', '24px', '24px', '48px'],
            mx: ['24px', '24px', '24px', '48px'],
            p: 0,
            listStyle: 'none',
          }}
        >
          <HeaderLink label={t('nav.products')}>
            <HeaderList
              links={[
                { label: t('nav.multiply'), link: INTERNAL_LINKS.multiply },
                { label: t('nav.borrow'), link: INTERNAL_LINKS.borrow },
                { label: t('nav.earn'), link: INTERNAL_LINKS.earn },
              ]}
            />
          </HeaderLink>
          <HeaderLink label={t('nav.assets')}>
            <HeaderList links={LANDING_PILLS} columns={2} />
          </HeaderLink>
          <HeaderLink
            label={t('nav.discover')}
            link={INTERNAL_LINKS.discover}
            onClick={() => {
              trackingEvents.discover.selectedInNavigation(userContext)
            }}
          />
        </Grid>
      )}
    </Flex>
  )
}

export function AppHeader() {
  const { web3Context$ } = useAppContext()
  const [context] = useObservable(web3Context$)

  const Header = useMemo(
    () => (context?.status === 'connected' ? ConnectedHeader : DisconnectedHeader),
    [context?.status],
  )

  return <Header />
}

export function ConnectPageHeader() {
  return (
    <BasicHeader>
      <Logo />
    </BasicHeader>
  )
}
