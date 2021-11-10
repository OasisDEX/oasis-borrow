import { slideInAnimation } from './animations'
import { icons } from './icons'

// Duplication from theme as exporting const from package library is breaking dai-ui website and theme-ui doesn't support yet transitions tokens :(
// To refactor if they will include this support
export const TRANSITIONS = {
  global: '150ms cubic-bezier(0.215,0.61,0.355,1)',
}

const oasisBaseTheme = {
  useBorderBox: true,
  useBodyStyles: true,
  breakpoints: ['48em', '56em', '64em'],
  colors: {
    primary: '#25273D',
    primaryAlt: '#D3D4D8',
    primaryEmphasis: '#626472',

    secondary: '#ECEFF9',
    secondaryAlt: '#F3F7F9',

    background: '#FFF',
    backgroundAlt: '#F1F3F4',
    surface: '#FFF',

    light: '#D1DEE6',
    lightIcon: '#BEC9D0',
    border: '#DDDEE6',
    borderSelected: '#A8A9B1',
    offBlue: '#CAD6DB',
    offWhite: '#F6F8F9',

    text: {
      focused: '#272940',
      muted: '#708390',
      off: '#686986',
      subtitle: '#787A9B',
      contrast: '#FFF',
    },

    link: '#575CFE',
    textAlt: 'rgba(37, 39, 61, 0.67)',
    onBackground: '#9FAFB9',
    onPrimary: '#FFF',
    onSurface: '#708390',
    muted: '#708390',
    mutedAlt: '#656F75',
    error: '#FDEDE8',
    onError: '#F75524',
    success: '#E7FCFA',
    onSuccess: '#1AAB9B',
    warning: '#FFF1CF',
    onWarning: '#D8762D',
    lavender: '#787A9B',
    lavender_o25: '#787a9b40',
    banner: {
      warning: '#FF6A16',
      danger: '#FE4343',
      muted: 'primary',
      dangerBorder: '#FBE1D9',
    },
    counter: {
      primary: '#FF7B31',
      secondary: '#FEB343',
      surface: '#FFDBC7',
    },
    bull: '#1AAB9B',
    bear: '#F75524',
    sliderTrackFill: '#9DA3DA',
    actionInputHover: '#E5E7E8',
  },
  fonts: {
    body: '"Inter", "Helvetica Neue", sans-serif',
    heading: '"FT Polar Trial", "Helvetica Neue", sans-serif',
    monospace: 'monospace',
  },
  //           0   1   2   3   4   5   6   7   8   9  10
  fontSizes: [10, 12, 14, 16, 18, 20, 24, 32, 52, 64, 96],
  fontWeights: {
    body: 400,
    heading: 500,
    medium: 500,
    semiBold: 600,
    bold: 700,
    heavy: 900,
  },
  lineHeights: {
    body: 1.5,
    bodyLoose: 1.7,
    heading: 1.2,
    tight: 1.05,
    loose: 1.35,
    //
    buttons: '2.1em',
    secondaryButton: 0.8,
    smallButton: 1.9,
  },
  text: {
    display: {
      fontFamily: 'heading',
      fontWeight: 'bold',
      fontSize: [7, 8],
    },
    header1: {
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
      fontSize: '40px',
      color: 'primary',
    },
    header2: {
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
      fontSize: 7,
      color: 'primary',
    },
    header3: {
      fontFamily: 'heading',
      fontWeight: 'bold',
      lineHeight: 'heading',
      fontSize: 5,
      color: 'primary',
    },
    paragraph1: {
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
      fontSize: 4,
      color: 'primary',
    },
    paragraph2: {
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
      fontSize: 3,
      color: 'primary',
    },
    paragraph3: {
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
      fontSize: 2,
      color: 'primary',
    },
    paragraph4: {
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
      fontSize: 1,
      color: 'primary',
    },
    subheader: {
      variant: 'text.paragraph2',
      color: 'text.subtitle',
    },
    caption: {
      variant: 'paragraph4',
      fontWeight: 'heading',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      opacity: 0.7,
    },
    tableHead: {
      variant: 'text.paragraph3',
      color: 'muted',
      fontWeight: 'semiBold',
    },
    strong: {
      variant: 'text.paragraph2',
      fontWeight: 'semiBold',
    },
    light: {
      color: 'lavender',
      fontSize: 4,
      lineHeight: 'bodyLoose',
      a: {
        variant: 'text.paragraph1',
        color: 'text.focused',
      },
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
    round: 32,
    circle: 50,
  },
  shadows: {
    card: '0px 0px 8px rgba(37, 39, 61, 0.1)',
    cardLanding: '0px 0px 8px rgba(0, 0, 0, 0.1)',
    fixedBanner: '0px 0px 16px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 8px rgba(0, 0, 0, 0.17)',
    light: '0 2px 8px rgba(0, 0, 0, 0.13)',
    surface: '0px 0px 8px rgba(0, 0, 0, 0.2)',
    surface_hovered: '0px 8px 8px rgba(0, 0, 0, 0.2)',
    table: '0px 0px 2px rgba(0, 0, 0, 0.2)',
    table_hovered: '0px 0px 10px rgba(0, 0, 0, 0.15)',
    banner: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    sliderThumb: '0px 1px 6px rgba(0, 0, 0, 0.15)',
    vaultEditingController: '0px 1px 6px rgba(37, 39, 61, 0.15)',
    vaultHistoryItem: '0px 1px 4px rgba(37, 39, 61, 0.12)',
    tooltipVaultHeader: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    buttonMenu: '0px 0px 8px rgba(0, 0, 0, 0.1)',
    vaultDetailsCard: '0px 1px 8px rgba(37, 39, 61, 0.1)',
    actionCard: '0px 2px 6px rgba(37, 39, 61, 0.25);',
  },
  gradients: {
    app: 'linear-gradient(180deg, #EAFFFB 0.01%, #EAF0FF 24.48%, rgba(255, 255, 255, 0) 100%)',
  },
  layout: {
    container: {
      maxWidth: '1232px',
      px: 3,
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
      maxWidth: '1200px',
    },
    termsContainer: {
      variant: 'layout.appContainer',
      maxWidth: '712px',
      mt: 5,
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
      ...slideInAnimation,
    },
    announcement: {
      maxWidth: '792px',
      alignSelf: 'center',
      zIndex: 4,
    },
  },
  metadata: {
    fontLinkHref: 'https://rsms.me/inter/inter.css',
  },
  cards: {
    primary: {
      border: '1px solid',
      borderColor: 'light',
      p: 3,
      borderRadius: 'roundish',
      bg: 'surface',
    },
    surface: {
      p: 3,
      borderRadius: 'roundish',
      bg: 'surface',
      boxShadow: 'surface',
    },
    primaryWithHover: {
      variant: 'cards.primary',
      cursor: 'pointer',
      transition: '150ms cubic-bezier(0.215,0.61,0.355,1)',
      '&:hover': {
        borderColor: 'mutedAlt',
        boxShadow: 'surface',
      },
    },
    secondary: {
      p: 3,
      borderRadius: 'roundish',
      border: 'none',
      bg: 'offWhite',
    },
    secondaryRounded: {
      variant: 'cards.secondary',
      borderRadius: 'large',
    },
    danger: {
      variant: 'cards.primary',
      borderColor: 'onError',
      bg: 'error',
    },
    warning: {
      variant: 'cards.primary',
      borderColor: 'onWarning',
      bg: 'warning',
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
      color: 'primary',
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
      p: 3,
      bg: 'secondaryAlt',
      borderRadius: 'large',
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
      color: 'text.contrast',
      transition: 'background 0.2s ease-in',
      '&:hover, &:focus-visible': {
        bg: 'primaryEmphasis',
      },
      '&:disabled': {
        bg: 'primaryAlt',
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
      borderColor: 'light',
      borderRadius: 'round',
      color: 'primary',
      fontWeight: 'semiBold',
      px: 4,
      py: 2,
      '&:focus': {
        outline: 'none',
      },
    },
    outlineSquare: {
      variant: 'text.paragraph2',
      background: 'none',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'light',
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
      bg: 'backgroundAlt',
      color: 'primary',
      borderRadius: 'round',
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
    square: {
      variant: 'text.paragraph2',
      bg: 'white',
      borderRadius: 'large',
      py: 3,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'light',
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
      color: 'text.muted',
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
        color: 'primary',
      },
    },
    textual: {
      variant: 'text.paragraph3',
      fontWeight: 'semiBold',
      color: 'link',
      cursor: 'pointer',
      background: 'none',
      transition: 'opacity ease-in 0.2s',
      '&:hover, &:focus-visible': {
        opacity: 0.7,
      },
      '&:focus': {
        outline: 'none',
      },
    },
    textualSmall: {
      variant: 'buttons.textual',
      fontSize: 1,
      color: 'primary',
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
      color: 'primary',
      userSelect: 'none',
      bg: 'backgroundAlt',
      px: 2,
      py: 1,
      borderRadius: 'round',
      lineHeight: 1.25,
      position: 'relative',
      '&:hover': {
        bg: 'actionInputHover',
      },
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
      bg: 'primary',
      '&:hover': {
        color: 'white',
        bg: 'primary',
      },
    },
    vaultEditingController: {
      fontFamily: 'body',
      fontSize: 3,
      fontWeight: 'semiBold',
      lineHeight: 'body',
      bg: 'background',
      p: 3,
      color: 'primary',
      boxShadow: 'vaultEditingController',
      borderRadius: 'inherit',
      cursor: 'pointer',
    },
    vaultEditingControllerInactive: {
      fontFamily: 'body',
      fontSize: 3,
      fontWeight: 'semiBold',
      bg: 'transparent',
      color: 'text.subtitle',
      cursor: 'pointer',
      transition: TRANSITIONS.global,
      '&:hover': {
        color: 'primary',
      },
    },
    mobileBottomMenu: {
      variant: 'buttons.secondary',
      bg: 'background',
      boxShadow: 'buttonMenu',
      fontSize: [1, 2],
    },
  },
  links: {
    primary: {
      px: 3,
      py: 2,
      variant: 'buttons.primary',
      display: 'inline-block',
      bg: 'primary',
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
        color: 'lavender',
      },
    },
    navFooter: {
      variant: 'links.nav',
      fontWeight: 'normal',
      fontSize: 3,
    },
    navHeader: {
      variant: 'links.nav',
      color: 'lavender',
      '&:hover, &:focus-visible': {
        color: 'primary',
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
  },
  icons,
  radio: {
    color: 'offBlue',
    'input:checked ~ &': {
      color: 'onSuccess',
    },
    'input:focus ~ &': {
      color: 'onSuccess',
    },
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
  forms: {
    label: {
      fontSize: 4,
      fontWeight: 'semiBold',
    },
    input: {
      outline: 'none',
      borderRadius: 'large',
      border: 'light',
      borderColor: 'muted',
      color: 'onSurface',
      fontWeight: 'body',
      fontFamily: 'body',
      p: 3,
      lineHeight: 'tight',
      fontSize: 5,
      '&:focus': {
        borderColor: 'primary',
        color: 'primary',
      },
      '&:disabled': {
        bg: 'background',
        pointerEvents: 'none',
      },
    },
    inputError: {
      variant: 'forms.input',
      borderColor: 'onError',
      '&:focus': {
        borderColor: 'onError',
      },
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
      color: 'primary',
      backgroundColor: 'primaryAlt',
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
      color: 'primary',
      borderRadius: 'large',
      fontWeight: 'body',
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
    mobileMenu: 3,
    modal: 4,
    cookie: 5,
    modalOnMobilePanel: 5,
  },
  grids: {
    vaultContainer: {
      gap: [3, null, 4, '48px'],
      gridTemplateColumns: ['1fr', '2fr minmax(425px, 1fr)', '2fr minmax(465px, 1fr)'],
      alignItems: 'flex-start',
    },
    vaultEditingControllerContainer: {
      bg: 'backgroundAlt',
      borderRadius: '2em',
      gap: '0px',
    },
    vaultDetailsCardsContainer: {
      gridTemplateColumns: ['1fr', null, null, '1fr 1fr'],
      alignSelf: 'flex-start',
      mb: 3,
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      fontSize: 3,
    },
    spinner: {
      default: {
        color: 'primary',
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
      variant: 'text.microHeading',
    },
    a: {
      variant: 'text.paragraph3',
      fontWeight: 'semiBold',
      textDecoration: 'none',
      cursor: 'pointer',
      color: 'link',
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
  },
}

export const theme = oasisBaseTheme
