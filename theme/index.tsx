import { FTPolar, Inter } from 'helpers/fonts'
import type { Theme } from 'theme-ui'

import { fadeInAnimation } from './animations'

const themeTypeSafe = <T extends Theme>(t: T) => t

// Duplication from theme as exporting const from package library is breaking dai-ui website and theme-ui doesn't support yet transitions tokens :(
// To refactor if they will include this support
export const TRANSITIONS = {
  global: '150ms cubic-bezier(0.215,0.61,0.355,1)',
}

export const GRADIENTS = {
  newsletterSuccess: 'linear-gradient(137.02deg, #2A30EE 0%, #A4A6FF 99.12%);',
}

// Used to share design system colours with theme-ui default color fields
const COLORS = {
  primary100: '#17344F',
  secondary100: '#E6E9EB',
  neutral10: '#FFFFFF',
}

export const theme = themeTypeSafe({
  useBorderBox: true,
  useRootStyles: true,
  breakpoints: ['48em', '60em', '68em'],
  colors: {
    // new design system colors
    interactive100: '#575CFE',
    interactive50: '#878BFC',
    interactive30: '#D8D9FE',
    interactive10: '#EDEDFF',
    primary100: COLORS.primary100,
    primary60: '#6D7B85',
    primary30: '#B6BDC2',
    secondary100: COLORS.secondary100,
    secondary60: '#F1F3F4',
    neutral10: COLORS.neutral10,
    neutral20: '#EAEAEA',
    neutral30: '#F3F7F9',
    neutral60: '#BEC9D0',
    neutral70: '#A8A9B1',
    neutral80: '#596F78',
    success100: '#1AAB9B',
    success10: '#E7FCFA',
    warning100: '#D8762D',
    warning10: '#FFF1CF',
    critical100: '#D94A1E',
    critical10: '#FFEEE9',

    // used by theme-ui internally
    primary: COLORS.primary100,
    secondary: COLORS.secondary100,
    background: COLORS.neutral10,
    text: COLORS.primary100,

    // special colors for some components
    lavender_o25: '#787a9b40',
    banner: {
      warning: 'warning100',
      danger: 'critical100',
      muted: 'primary100',
      dangerBorder: 'critical10',
    },
    counter: {
      primary: '#FF7B31',
      secondary: '#FEB343',
      surface: '#FFDBC7',
    },
  },
  fonts: {
    body: `${Inter.style.fontFamily}, "Helvetica Neue", sans-serif`,
    heading: `${FTPolar.style.fontFamily}, "Helvetica Neue", sans-serif`,
    monospace: 'monospace',
  },
  //           0   1   2   3   4   5   6   7   8   9  10
  fontSizes: [10, 12, 14, 16, 18, 20, 24, 32, 52, 64, 96],
  fontWeights: {
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    bodyLoose: 1.7,
    tight: 1.05,
    loose: 1.35,
    //
    buttons: '2.1em',
    secondaryButton: 0.8,
    smallButton: 1.9,
  },
  text: {
    heroHeader: {
      fontFamily: 'heading',
      fontWeight: 'medium',
      lineHeight: ['68px', '80px'],
      fontSize: ['64px', '76px'],
      letterSpacing: '-0.02em',
      color: 'primary100',
    },
    header1: {
      fontFamily: 'heading',
      fontWeight: 'medium',
      lineHeight: '54px',
      fontSize: '52px',
      letterSpacing: '-0.02em',
      color: 'primary100',
    },
    header2: {
      fontFamily: 'heading',
      fontWeight: 'medium',
      lineHeight: '54px',
      fontSize: '40px',
      letterSpacing: '-0.02em',
      color: 'primary100',
      display: 'block',
    },
    header3: {
      fontFamily: 'heading',
      fontWeight: 'medium',
      lineHeight: '42px',
      fontSize: '32px',
      color: 'primary100',
    },
    header4: {
      fontFamily: 'heading',
      fontWeight: 'semiBold',
      lineHeight: '40px',
      fontSize: '28px',
      color: 'primary100',
    },
    header5: {
      fontFamily: 'heading',
      fontWeight: 'semiBold',
      lineHeight: '32px',
      fontSize: '20px',
      color: 'primary100',
    },
    paragraph1: {
      fontFamily: 'body',
      lineHeight: '28px',
      fontSize: '18px',
      color: 'primary100',
    },
    boldParagraph1: {
      fontFamily: 'body',
      lineHeight: '28px',
      fontWeight: 'semiBold',
      fontSize: '18px',
      color: 'primary100',
    },
    paragraph2: {
      fontFamily: 'body',

      lineHeight: '24px',
      fontSize: '16px',
      color: 'primary100',
    },
    boldParagraph2: {
      fontFamily: 'body',
      fontWeight: 'semiBold',
      lineHeight: '24px',
      fontSize: '16px',
      color: 'primary100',
    },
    paragraph3: {
      fontFamily: 'body',

      lineHeight: '22px',
      fontSize: '14px',
      color: 'primary100',
    },
    boldParagraph3: {
      fontFamily: 'body',
      fontWeight: 'semiBold',
      lineHeight: '22px',
      fontSize: '14px',
      color: 'primary100',
    },
    paragraph4: {
      fontFamily: 'body',
      fontWeight: 'semiBold',
      lineHeight: '20px',
      fontSize: '12px',
      color: 'primary100',
    },
    swapHeader: {
      fontFamily: 'body',
      fontWeight: 'bold',
      lineHeight: '29px',
      fontSize: '24px',
      color: 'primary100',
    },
    managedVolumeValue: {
      fontFamily: 'heading',
      fontWeight: 'medium',
      lineHeight: '64px',
      fontSize: '52px',
      color: 'primary100',
    },
  },
  borders: {
    light: '1px solid #787a9b40',
    lightMuted: '1px solid #F0F0F0',
    bold: '3px solid #D3D4D8',
  },
  //      0  1  2   3   4   5    6    7    8
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  sizes: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  radii: {
    small: 4,
    medium: 8,
    mediumLarge: 12,
    large: 16,
    roundish: 20,
    rounder: 24,
    round: 32,
    circle: 50,
    ellipse: '50%',
  },
  shadows: {
    card: '0px 0px 8px rgba(37, 39, 61, 0.1)',
    cardLanding: '0px 0px 8px rgba(0, 0, 0, 0.1)',
    fixedBanner: '0px 0px 16px rgba(0, 0, 0, 0.1)',
    selectMenu: '0px 0px 16px rgba(0, 0, 0, 0.15)',
    medium: '0 2px 8px rgba(0, 0, 0, 0.17)',
    light: '0 2px 8px rgba(0, 0, 0, 0.13)',
    surface: '0px 0px 8px rgba(0, 0, 0, 0.2)',
    surface_hovered: '0px 8px 8px rgba(0, 0, 0, 0.2)',
    table: '0px 0px 2px rgba(0, 0, 0, 0.2)',
    table_hovered: '0px 0px 10px rgba(0, 0, 0, 0.15)',
    banner: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    sliderThumb: '0px 1px 6px rgba(0, 0, 0, 0.15)',
    vaultEditingController: '0px 1px 6px rgba(37, 39, 61, 0.15)',
    tooltipVaultHeader: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    buttonMenu: '0px 0px 8px rgba(0, 0, 0, 0.1)',
    vaultDetailsCard: '0px 1px 8px rgba(37, 39, 61, 0.1)',
    actionCard: '0px 2px 6px rgba(37, 39, 61, 0.25)',
    elevation: '0px 4px 28px rgba(37, 39, 61, 0.36)',
    userSettingsOptionButton: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    bottomSheet: '0px 4px 28px rgba(37, 39, 61, 0.3)',
  },
  layout: {
    container: {
      maxWidth: '1200px',
      px: 3,
      '@media screen and (min-width: 1232px)': {
        px: 0,
      },
    },
    appContainer: {
      variant: 'layout.container',
    },
    marketingContainer: {
      variant: 'layout.appContainer',
    },
    marketingSmallContainer: {
      variant: 'layout.appContainer',
      maxWidth: '804px',
    },
    landingContainer: {
      variant: 'layout.appContainer',
    },
    termsContainer: {
      variant: 'layout.appContainer',
      maxWidth: '712px',
      mt: 5,
      table: {
        border: '1px solid black',
        borderCollapse: 'collapse',
        fontSize: ['2vw', '14px'],
      },
      th: {
        border: '1px solid black',
      },
      td: {
        border: '1px solid black',
        padding: '5px',
      },
    },
    modal: {
      variant: 'layout.appContainer',
    },
    modalHalf: {
      variant: 'layout.modal',
      minHeight: '50vh',
    },
    vaultPageContainer: {
      maxWidth: ['400px', '1232px'],
      zIndex: 1,
      position: 'relative',
      ...fadeInAnimation,
    },
    vaultPageContainerStatic: {
      variant: 'layout.vaultPageContainer',
      opacity: 1,
      animation: 'initial',
    },
    announcement: {
      maxWidth: '792px',
      alignSelf: 'center',
      zIndex: 4,
    },
    buttonPair: {
      minWidth: '200px',
      width: 'unset',
    },
    navigation: {
      maxWidth: '1408px',
      px: '16px',
    },
    portfolio: {
      maxWidth: '1408px',
      px: '16px',
    },
  },
  cards: {
    primary: {
      border: '1px solid',
      borderColor: 'secondary100',
      p: 3,
      borderRadius: 'roundish',
      bg: 'neutral10',
    },
    surface: {
      p: 3,
      borderRadius: 'roundish',
      bg: 'neutral10',
      boxShadow: 'surface',
    },
    primaryWithHover: {
      variant: 'cards.primary',
      cursor: 'pointer',
      transition: '150ms cubic-bezier(0.215,0.61,0.355,1)',
      '&:hover': {
        borderColor: 'primary60',
        boxShadow: 'surface',
      },
    },
    secondary: {
      p: 3,
      borderRadius: 'roundish',
      border: 'none',
      bg: 'neutral30',
    },
    secondaryRounded: {
      variant: 'cards.secondary',
      borderRadius: 'large',
    },
    danger: {
      variant: 'cards.primary',
      borderColor: 'critical100',
      bg: 'critical10',
    },
    warning: {
      variant: 'cards.primary',
      borderColor: 'warning100',
      bg: 'warning10',
    },
    ok: {
      variant: 'cards.primary',
      borderColor: 'success100',
      bg: 'success10',
    },
    notice: {
      variant: 'cards.primary',
      borderColor: 'secondary60',
      bg: 'secondary60',
    },
    vaultFormContainer: {
      variant: 'cards.primary',
      boxShadow: ['none', 'card'],
      borderRadius: 'mediumLarge',
      p: [0, 3],
      border: ['none', 'lightMuted'],
      overflowX: ['visible', 'hidden'],
    },
    tooltip: {
      variant: 'cards.primary',
      position: 'absolute',
      boxShadow: 'surface',
      borderRadius: 'small',
      color: 'primary100',
      zIndex: 1,
    },
    tooltipVaultHeader: {
      variant: 'cards.tooltip',
      boxShadow: 'tooltipVaultHeader',
      p: 2,
      bottom: '-10px',
      left: ['-80px', '-40px'],
      transform: 'translateY(100%)',
      width: ['250px', '352px'],
    },
    vaultDetailsCardModal: {
      variant: 'text.header5',
      p: 3,
      bg: 'neutral30',
      borderRadius: 'large',
    },
    cookieBanner: {
      boxShadow: 'fixedBanner',
      bg: 'neutral10',
      borderRadius: '16px 16px 0 0',
      padding: '24px',
      pb: 3,
    },
    positionsPage: {
      boxSizing: 'border-box',
      backgroundColor: 'neutral10',
      boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: 'large',
      padding: '32px',
    },
    faq: {
      variant: 'cards.primary',
      p: 4,
      border: ['none', 'lightMuted'],
      maxWidth: '711px',
    },
  },
  badges: {
    dsr: {
      paddingLeft: '12px',
      paddingRight: '12px',
      paddingTop: '6px',
      paddingBottom: '6px',
    },
    onramp: {
      variant: 'badges.primary',
      px: 2,
    },
  },
  buttons: {
    primary: {
      variant: 'text.paragraph1',
      cursor: 'pointer',
      fontWeight: 'semiBold',
      borderRadius: 'round',
      lineHeight: 'buttons',
      color: 'neutral10',
      transition: 'background 200ms',
      '&:hover, &:focus-visible': {
        bg: 'primary60',
      },
      '&:disabled': {
        bg: 'neutral60',
        pointerEvents: 'none',
      },
      '&:focus': {
        outline: 'none',
      },
    },
    outline: {
      variant: 'text.paragraph2',
      cursor: 'pointer',
      background: 'none',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'secondary100',
      borderRadius: 'round',
      color: 'primary100',
      fontWeight: 'semiBold',
      px: 4,
      py: 2,
      '&:focus': {
        outline: 'none',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
    outlineSquare: {
      variant: 'text.paragraph2',
      background: 'none',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'secondary100',
      borderRadius: 'mediumLarge',
      '&:focus': {
        outline: 'none',
      },
    },
    secondary: {
      variant: 'text.paragraph3',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      fontWeight: 'semiBold',
      bg: 'secondary60',
      color: 'primary100',
      borderRadius: 'round',
      px: 4,
      py: 2,
      transition: 'background-color 200ms',
      '&:focus': {
        outline: 'none',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
      '&:hover': {
        backgroundColor: 'secondary100',
      },
    },
    tertiary: {
      variant: 'text.paragraph3',
      px: '24px',
      py: 2,
      fontSize: 1,
      fontWeight: 'semiBold',
      lineHeight: '20px',
      cursor: 'pointer',
      bg: 'secondary60',
      color: 'primary100',
      borderRadius: 'round',
      whiteSpace: 'nowrap',
      transition: 'background-color 200ms, border-color 200ms',
      '&:hover': {
        bg: 'secondary100',
      },
      '&:focus': {
        outline: 'none',
      },
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
    action: {
      variant: 'buttons.tertiary',
      bg: 'neutral10',
      border: '1px solid',
      borderColor: 'neutral20',
      borderRadius: 'rounder',
      '&:hover': {
        bg: 'neutral10',
        borderColor: 'primary100',
      },
    },
    actionActiveGreen: {
      variant: 'buttons.tertiary',
      bg: 'success100',
      color: 'neutral10',
      '&:hover': {
        bg: 'success100',
      },
    },
    square: {
      variant: 'text.paragraph2',
      bg: 'white',
      borderRadius: 'large',
      py: 3,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'secondary100',
      '&:focus': {
        outline: 'none',
      },
      '&:focus-visible': {
        boxShadow: 'surface',
      },
    },
    expandable: {
      variant: 'text.header3',
      width: '100%',
      background: 'none',
      textAlign: 'left',
      cursor: 'pointer',
      p: 0,
      py: 4,
      ':hover': {
        opacity: 0.7,
      },
      ':focus': {
        outline: 'none',
      },
    },
    tableHeader: {
      variant: 'text.tableHead',
      background: 'none',
      p: 0,
      cursor: 'pointer',
      ':focus': {
        outline: 'none',
      },
      '&:focus-visible': {
        textDecoration: 'underline',
      },
    },
    filter: {
      borderRadius: 'round',
      background: 'none',
      color: 'neutral80',
      fontFamily: 'body',
      fontWeight: 'semiBold',
      cursor: 'pointer',
      boxSizing: 'border-box',
      border: '1px solid transparent',
      px: 4,
      transition: 'borderColor ease-in 0.3s, color ease-in 0.3s',
      font: '',
      ':focus': {
        outline: 'none',
      },
      '&:focus-visible': {
        textDecoration: 'underline',
      },
      '&[data-selected="true"]': {
        border: 'light',
        color: 'primary100',
      },
    },
    textual: {
      variant: 'text.paragraph3',
      fontWeight: 'semiBold',
      color: 'interactive100',
      cursor: 'pointer',
      background: 'none',
      transition: 'opacity 200ms',
      '&:hover, &:focus-visible': {
        opacity: 0.7,
      },
      '&:focus': {
        outline: 'none',
      },
      '&:disabled': {
        opacity: 0.5,
      },
    },
    textualSmall: {
      variant: 'buttons.textual',
      fontSize: 1,
      color: 'primary100',
      py: 0,
    },
    actionOption: {
      fontFamily: 'body',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: 1,
      fontWeight: 'semiBold',
      color: 'primary100',
      userSelect: 'none',
      bg: 'secondary60',
      px: 2,
      py: 1,
      borderRadius: 'round',
      lineHeight: 1.25,
      position: 'relative',
      '&:hover': {
        bg: 'secondary100',
      },
      transition: 'background-color 200ms',
    },
    actionOptionOpened: {
      variant: 'buttons.actionOption',
      borderRadius: 'mediumLarge',
      borderBottomLeftRadius: '0px',
      borderBottomRightRadius: '0px',
    },
    bean: {
      variant: 'buttons.actionOption',
      px: 3,
      py: 2,
      width: 'initial',
    },
    beanActive: {
      variant: 'buttons.bean',
      color: 'white',
      bg: 'primary100',
      '&:hover': {
        color: 'white',
        bg: 'primary100',
      },
    },
    vaultEditingController: {
      fontFamily: 'body',
      fontSize: 3,
      fontWeight: 'semiBold',
      lineHeight: 'body',
      bg: 'neutral10',
      p: 3,
      color: 'primary100',
      boxShadow: 'vaultEditingController',
      borderRadius: 'inherit',
      cursor: 'pointer',
    },
    vaultEditingControllerInactive: {
      fontFamily: 'body',
      fontSize: 3,
      fontWeight: 'semiBold',
      bg: 'transparent',
      color: 'neutral80',
      cursor: 'pointer',
      transition: TRANSITIONS.global,
      '&:hover': {
        color: 'primary100',
      },
    },
    tab: {
      display: 'flex',
      alignItems: 'center',
      fontFamily: 'body',
      fontWeight: 'semiBold',
      lineHeight: 'body',
      bg: 'transparent',
      color: 'neutral80',
      cursor: 'pointer',
      transition: TRANSITIONS.global,
    },
    menuButton: {
      variant: 'buttons.secondary',
      bg: 'neutral10',
      boxShadow: 'buttonMenu',
      fontSize: [1, 2],
      minHeight: ['40px', 'auto'],
      ':hover': {
        boxShadow: 'selectMenu',
      },
      transition: TRANSITIONS.global,
    },
    menuButtonRound: {
      variant: 'buttons.menuButton',
      width: '50px',
      height: '50px',
      padding: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    unStyled: {
      background: 'unset',
      border: 'unset',
      color: 'inherit',
      cursor: 'pointer',
      fontFamily: 'body',
    },
    actionActive: {
      variant: 'buttons.action',
      borderColor: 'primary100',
    },
    pill: {
      px: '24px',
      py: '12px',
      color: 'neutral80',
      fontFamily: 'body',
      fontSize: 3,
      fontWeight: 'semiBold',
      lineHeight: 'heading',
      border: 'none',
      borderRadius: 'round',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'neutral20',
      },
      transition: 'color 200ms, background-color 200ms',
    },
    pillActive: {
      variant: 'buttons.pill',
      color: 'neutral10',
      backgroundColor: 'interactive100',
      '&:hover': {
        backgroundColor: 'interactive100',
      },
    },
    networkPicker: {
      backgroundColor: 'transparent',
      color: 'primary100',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      fontSize: '14px',
      padding: 2,
      cursor: 'pointer',
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
  links: {
    unStyled: {
      all: 'unset',
    },
    inText: {
      textDecoration: 'none',
      color: 'interactive100',
    },
    primary: {
      px: 3,
      py: 2,
      variant: 'buttons.primary',
      display: 'inline-block',
      bg: 'primary100',
      '&, &:visited': {
        textDecoration: 'none',
      },
      '&:focus': {
        outline: 'none',
      },
      '&:focus-visible': {
        textDecoration: 'underline',
      },
    },
    nav: {
      variant: 'text.paragraph3',
      cursor: 'pointer',
      display: 'inline-block',
      fontWeight: 'semiBold',
      transition: 'color 0.2s',
      '&, &:visited': {
        textDecoration: 'none',
      },
      '&:focus': {
        outline: 'none',
      },
      '&:hover, &:focus-visible': {
        color: 'neutral80',
      },
    },
    navFooter: {
      variant: 'links.nav',
      fontWeight: 'normal',
      fontSize: 3,
    },
    navHeader: {
      variant: 'links.nav',
      color: 'neutral80',
      '&:hover, &:focus-visible': {
        color: 'primary100',
      },
    },
    outline: {
      variant: 'buttons.outline',
      display: 'inline-block',
      '&, &:visited': {
        textDecoration: 'none',
      },
      '&:focus': {
        outline: 'none',
      },
      '&:focus-visible': {
        textDecoration: 'underline',
      },
    },
    secondary: {
      variant: 'buttons.secondary',
      display: 'inline-block',
      '&, &:visited': {
        textDecoration: 'none',
      },
      '&:focus': {
        outline: 'none',
      },
      '&:focus-visible': {
        textDecoration: 'underline',
      },
    },
    settings: {
      color: 'primary60',
      fontWeight: 'medium',
      fontSize: 1,
      textDecoration: 'none',
    },
    networkPicker: {
      backgroundColor: 'transparent',
      color: 'primary100',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      fontSize: '14px',
      padding: 0,
      cursor: 'pointer',
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
  forms: {
    label: {
      fontSize: 4,
      fontWeight: 'semiBold',
    },
    input: {
      outline: 'none',
      borderRadius: 'large',
      border: 'light',
      borderColor: 'neutral80',
      color: 'neutral80',
      fontWeight: 'regular',
      fontFamily: 'body',
      p: 3,
      lineHeight: 'tight',
      fontSize: 5,
      '&:focus': {
        borderColor: 'primary100',
        color: 'primary100',
      },
      '&:disabled': {
        bg: 'neutral10',
        pointerEvents: 'none',
      },
    },
    inputError: {
      variant: 'forms.input',
      borderColor: 'critical100',
      '&:focus': {
        borderColor: 'critical100',
      },
    },
    inputSecondary: {
      variant: 'forms.input',
      bg: 'secondary60',
      borderRadius: 'small',
      color: 'neutral80',
      p: 2,
      fontSize: 2,
      lineHeight: 'bodyLoose',
      borderColor: 'neutral60',
    },
    search: {
      fontFamily: 'body',
      variant: 'forms.input',
      borderRadius: 'round',
      fontSize: 2,
      fontWeight: 'semiBold',
      border: '1px solid #D1DEE6',
      p: 0,
      ':focus-within': {
        //indicate that input is focused
      },
    },
    plain: {
      p: 0,
      border: 'none',
      ':focus': {
        outline: 'none',
      },
    },
    select: {
      variant: 'forms.input',
    },
    textarea: { variant: 'forms.input', lineHeight: 'body' },
    textareaError: { variant: 'forms.inputError' },
    slider: {
      color: 'primary100',
      backgroundColor: 'neutral60',
      height: 1,
      borderRadius: 'small',
      '&::-webkit-slider-thumb': {
        boxShadow: 'sliderThumb',
        width: '20px',
        height: '20px',
        transition: TRANSITIONS.global,
      },
      '&:not([disabled]):active::-webkit-slider-thumb': {
        transform: 'scale(1.1)',
      },
      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5,
      },
    },
  },
  alerts: {
    primary: {
      width: '100%',
      justifyContent: ['flex-start', 'center'],
    },
    readonly: {
      variant: 'alerts.primary',
      bg: 'txManagerBg',
      color: 'primary100',
      borderRadius: 'large',
      fontWeight: 'regular',
      px: 2,
      py: 3,
      lineHeight: 'loose',
      display: 'inline-block',
      textAlign: 'center',
    },
  },
  zIndices: {
    menu: 3,
    footer: 2,
    modal: 4,
    cookie: 5,
    modalOnMobilePanel: 5,
    mobileMenu: 6,
  },
  grids: {
    vaultContainer: {
      gap: [3, null, 4, '48px'],
      gridTemplateColumns: ['1fr', '2fr minmax(425px, 1fr)', '2fr minmax(465px, 1fr)'],
      alignItems: 'flex-start',
    },
    vaultEditingControllerContainer: {
      bg: 'secondary60',
      borderRadius: '2em',
      gap: '0px',
    },
    vaultDetailsCardsContainer: {
      gridTemplateColumns: ['1fr', null, null, '1fr 1fr'],
      alignSelf: 'flex-start',
      mb: 3,
    },
    tabSwitcher: {
      bg: 'secondary60',
      borderRadius: '2em',
      gap: '0px',
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'regular',
      fontSize: 3,
    },
    spinner: {
      default: {
        color: 'primary100',
        strokeWidth: 3,
        size: 16,
        opacity: 1,
        zIndex: 1,
      },
      small: {
        variant: 'styles.spinner.default',
        size: 12,
      },
      large: {
        variant: 'styles.spinner.default',
        size: 24,
      },
      extraLarge: {
        variant: 'styles.spinner.default',
        size: 50,
      },
    },
    h1: {
      variant: 'text.header1',
    },
    h2: {
      variant: 'text.header2',
    },
    h3: {
      variant: 'text.header3',
    },
    h4: {
      variant: 'text.header4',
    },
    h5: {
      variant: 'text.header5',
    },
    a: {
      variant: 'text.paragraph3',
      fontWeight: 'semiBold',
      textDecoration: 'none',
      cursor: 'pointer',
      color: 'interactive100',
    },
    hr: {
      borderBottom: 'lightMuted',
      m: 0,
    },
    hrVaultFormBottom: {
      borderBottom: 'lightMuted',
      mb: -2,
      position: 'relative',
      width: 'calc(100% + 64px)',
      left: -4,
    },
    hrVaultFormTop: {
      borderBottom: 'lightMuted',
      pt: 2,
      mt: 3,
      mb: 4,
      position: 'relative',
      width: 'calc(100% + 64px)',
      left: -4,
    },
    collapsedContentContainer: {
      p: 2,
      pb: 3,
      border: 'lightMuted',
      borderTop: 'none',
      borderBottomLeftRadius: 'mediumLarge',
      borderBottomRightRadius: 'mediumLarge',
    },
    chevronUpDown: {
      sort: {
        ml: 1,
        display: 'flex',
        width: 1,
      },
      select: {
        ml: 1,
        position: 'relative',
        top: '1px',
      },
    },
  },
  boxes: {
    separator: {
      borderTop: '1px solid',
      borderColor: 'neutral20',
      height: '1px',
      width: '100%',
    },
  },
})

export const ajnaExtensionTheme = {
  colors: {
    primary100: '#031371',
    neutral80: '#6871aa',
    interactive100: '#c527ae',
    interactive50: '#d668C6',
  },
}

export type OasisTheme = typeof theme
