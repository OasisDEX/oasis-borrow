import '@uniswap/widgets/fonts.css'

import { SwapWidget } from '@uniswap/widgets'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { tokenList } from 'components/uniswapWidget/tokenList'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
  SwapWidgetState,
} from 'features/automation/protection/common/UITypes/SwapWidgetChange'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useOnboarding } from 'helpers/useOnboarding'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { keyBy } from 'lodash'
import { Trans, useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { theme } from 'theme'
import { Box, Button, Flex, Image, SxStyleProp, Text } from 'theme-ui'

const { colors, radii } = theme

const widgetTheme = {
  accent: colors.primary100,
  primary: colors.primary100,
  container: colors.neutral10,
  active: colors.primary100,
  interactive: colors.neutral10,
  module: colors.neutral30,
  dialog: colors.neutral10,
  success: colors.success10,
  error: colors.critical10,
  tokenColorExtraction: false,
  borderRadius: radii.mediumLarge,
  fontFamily: 'Inter',
}

function scrollbarBg(hexColor: string) {
  return `radial-gradient( closest-corner at 0.25em 0.25em, ${hexColor} 0.25em, transparent 0.25em ), linear-gradient( to bottom, ${hexColor}00 0.25em, ${hexColor} 0.25em, ${hexColor} calc(100% - 0.25em), ${hexColor}00 calc(100% - 0.25em) ), radial-gradient( closest-corner at 0.25em calc(100% - 0.25em), ${hexColor} 0.25em, ${hexColor}00 0.25em )`
}

const cssPaths = (() => {
  const main = 'div > div:nth-of-type(2) > div:nth-of-type(2)'
  const tokenSelAndSettings = 'div > div:nth-of-type(1)'

  return {
    main: {
      swapBtn: `${main} > div:nth-of-type(2) > div > button`,
      token1Btn: `${main} > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > button`,
      token2Btn: `${main} > div:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > button`,
      input1: `${main} > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div > input`,
      input2: `${main} > div:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > div > input`,
    },
    // token select
    tokenSel: {
      // hoverAppended is for expanding the hover effect through the scrollbar (we'll hide it)
      hoverAppended: `${tokenSelAndSettings} > div > div:nth-of-type(3) > div:nth-of-type(1)`,
      option: `${tokenSelAndSettings} > div > div:nth-of-type(3) > div:nth-of-type(2) > div > div > button`,
      search: `${tokenSelAndSettings} input[inputmode=text]`,
      scrollbar: `${tokenSelAndSettings} .scrollbar`,
    },
    settings: {
      tooltip: `${tokenSelAndSettings} > div > div:nth-of-type(3) > div:nth-of-type(1).caption`,
    },
  }
})()

const OnboardingGraphic = () => (
  <Box sx={{ position: 'relative' }}>
    <Image
      src={staticFilesRuntimeUrl('/static/img/logo.svg')}
      sx={{ position: 'absolute', top: '45px', left: '24px', width: '60.6px' }}
    />
    <svg
      width="286"
      height="108"
      viewBox="0 0 286 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_4557_35793)">
        <circle
          cx="54"
          cy="54"
          r="46"
          fill="url(#paint0_radial_4557_35793)"
          fillOpacity="0.2"
          shapeRendering="crispEdges"
        />
        <circle
          cx="54"
          cy="54"
          r="45.5"
          stroke="url(#paint1_radial_4557_35793)"
          strokeOpacity="0.2"
          shapeRendering="crispEdges"
        />
      </g>
      <g filter="url(#filter1_d_4557_35793)">
        <circle cx="232" cy="54" r="46" fill="url(#paint2_linear_4557_35793)" />
      </g>
      <g filter="url(#filter2_d_4557_35793)">
        <circle cx="232" cy="54" r="46" fill="url(#paint3_linear_4557_35793)" />
        <circle cx="232" cy="54" r="45.5" stroke="#FF007A" strokeOpacity="0.1" />
      </g>
      <g clipPath="url(#clip0_4557_35793)">
        <path
          d="M222.924 36.0031C222.394 35.9206 222.371 35.9115 222.621 35.8734C223.099 35.8 224.227 35.8997 225.004 36.0847C226.818 36.5163 228.47 37.6216 230.233 39.5838L230.701 40.1052L231.371 39.9973C234.194 39.5439 237.064 39.9039 239.466 41.0138C240.127 41.3194 241.168 41.9269 241.299 42.0828C241.34 42.1327 241.417 42.4528 241.468 42.7946C241.647 43.977 241.557 44.8838 241.195 45.5602C240.999 45.9283 240.988 46.0453 241.12 46.3609C241.226 46.6129 241.52 46.7988 241.812 46.7979C242.409 46.7979 243.052 45.8322 243.349 44.4902L243.467 43.9571L243.701 44.2227C244.986 45.6781 245.995 47.6629 246.168 49.0766L246.213 49.4447L245.998 49.1101C245.626 48.5343 245.252 48.1417 244.774 47.8252C243.912 47.2549 243.001 47.0609 240.588 46.9339C238.408 46.8188 237.174 46.6329 235.951 46.2339C233.87 45.5557 232.82 44.6516 230.348 41.4073C229.25 39.9665 228.571 39.1695 227.896 38.5275C226.362 37.0685 224.854 36.3041 222.924 36.0049L222.924 36.0031Z"
          fill="#FF007A"
        />
        <path
          d="M241.791 39.2193C241.846 38.2536 241.977 37.6171 242.24 37.0359C242.344 36.8056 242.442 36.617 242.457 36.617C242.471 36.617 242.427 36.7865 242.356 36.9942C242.165 37.5582 242.133 38.3307 242.265 39.2284C242.433 40.3682 242.527 40.5323 243.732 41.7636C244.297 42.3412 244.955 43.0694 245.192 43.3822L245.626 43.9507L245.192 43.5445C244.663 43.0476 243.444 42.0792 243.176 41.9405C242.995 41.848 242.968 41.8489 242.857 41.9595C242.755 42.062 242.733 42.2152 242.719 42.9397C242.697 44.0695 242.543 44.7949 242.171 45.5203C241.97 45.9129 241.938 45.8286 242.12 45.3861C242.256 45.0551 242.27 44.91 242.269 43.8156C242.267 41.6177 242.006 41.089 240.475 40.1841C240.087 39.9547 239.449 39.6237 239.056 39.4487C238.664 39.2737 238.351 39.1214 238.363 39.1105C238.406 39.067 239.899 39.5031 240.499 39.7343C241.392 40.078 241.54 40.1224 241.649 40.0807C241.721 40.0526 241.757 39.8413 241.792 39.2184L241.791 39.2193Z"
          fill="#FF007A"
        />
        <path
          d="M223.953 42.9805C222.877 41.4998 222.212 39.2293 222.356 37.5328L222.4 37.0078L222.645 37.0522C223.105 37.1356 223.897 37.4312 224.269 37.6561C225.287 38.2745 225.729 39.0887 226.177 41.1806C226.308 41.7927 226.481 42.4863 226.561 42.7212C226.688 43.0993 227.171 43.9815 227.563 44.5546C227.846 44.9672 227.659 45.163 227.034 45.1068C226.08 45.0207 224.788 44.1284 223.954 42.9814L223.953 42.9805Z"
          fill="#FF007A"
        />
        <path
          d="M240.486 54.0002C235.46 51.9763 233.69 50.2199 233.69 47.2558C233.69 46.8197 233.706 46.4624 233.724 46.4624C233.742 46.4624 233.937 46.6066 234.156 46.7825C235.176 47.5995 236.317 47.9495 239.476 48.4101C241.335 48.6812 242.381 48.9006 243.347 49.2207C246.415 50.2381 248.313 52.3027 248.766 55.1146C248.897 55.9315 248.82 57.4639 248.607 58.2718C248.439 58.9102 247.925 60.059 247.789 60.1035C247.751 60.1152 247.714 59.9711 247.705 59.7743C247.653 58.718 247.12 57.6906 246.223 56.9199C245.204 56.044 243.836 55.3476 240.488 53.9993L240.486 54.0002Z"
          fill="#FF007A"
        />
        <path
          d="M236.958 54.8407C236.895 54.4663 236.786 53.9875 236.715 53.7771L236.587 53.3954L236.826 53.6629C237.155 54.0328 237.416 54.5061 237.637 55.1372C237.805 55.6187 237.824 55.762 237.822 56.5436C237.821 57.3116 237.8 57.4721 237.645 57.9055C237.399 58.5883 237.095 59.0734 236.584 59.593C235.666 60.5269 234.486 61.0447 232.782 61.2596C232.485 61.2968 231.623 61.3593 230.864 61.3992C228.952 61.499 227.694 61.7039 226.563 62.101C226.401 62.1582 226.256 62.1926 226.241 62.1781C226.194 62.1328 226.965 61.674 227.601 61.3675C228.497 60.9359 229.39 60.7001 231.39 60.3664C232.377 60.2014 233.398 60.0019 233.657 59.923C236.103 59.1732 237.361 57.2373 236.958 54.8416V54.8407Z"
          fill="#FF007A"
        />
        <path
          d="M239.262 58.9329C238.595 57.4975 238.442 56.1111 238.807 54.819C238.846 54.6812 238.91 54.5678 238.947 54.5678C238.984 54.5678 239.142 54.653 239.297 54.7573C239.604 54.965 240.222 55.3132 241.866 56.2099C243.917 57.3288 245.087 58.1948 245.882 59.1841C246.579 60.0509 247.01 61.0383 247.218 62.2416C247.335 62.9235 247.267 64.5638 247.092 65.2511C246.541 67.4164 245.259 69.1165 243.43 70.1085C243.161 70.2536 242.921 70.3733 242.896 70.3742C242.869 70.3742 242.967 70.1267 243.112 69.8229C243.728 68.5371 243.798 67.2858 243.333 65.894C243.048 65.0416 242.468 64.0016 241.295 62.2434C239.932 60.1996 239.598 59.6556 239.262 58.9347V58.9329Z"
          fill="#FF007A"
        />
        <path
          d="M220.384 66.6774C222.249 65.1024 224.569 63.9835 226.684 63.6407C227.595 63.4929 229.112 63.5509 229.956 63.7676C231.308 64.114 232.518 64.8884 233.147 65.8124C233.762 66.7146 234.026 67.5016 234.301 69.2517C234.408 69.9417 234.526 70.6354 234.563 70.7922C234.768 71.699 235.17 72.4244 235.667 72.788C236.457 73.3665 237.817 73.4018 239.155 72.8805C239.382 72.7916 239.58 72.7308 239.593 72.7444C239.642 72.7925 238.968 73.2441 238.492 73.4807C237.853 73.7999 237.344 73.9241 236.668 73.9241C235.443 73.9241 234.425 73.3003 233.576 72.029C233.409 71.7788 233.034 71.0298 232.742 70.3642C231.846 68.3195 231.403 67.6966 230.363 67.0156C229.457 66.4226 228.289 66.3165 227.41 66.7472C226.256 67.313 225.934 68.7883 226.761 69.7232C227.089 70.0949 227.702 70.415 228.204 70.4776C229.141 70.5946 229.946 69.8809 229.946 68.9343C229.946 68.3195 229.71 67.9695 229.116 67.7011C228.303 67.3348 227.431 67.7628 227.435 68.5263C227.436 68.8518 227.578 69.0558 227.904 69.2036C228.114 69.2979 228.118 69.3061 227.948 69.2707C227.203 69.1166 227.028 68.218 227.628 67.6213C228.347 66.9059 229.834 67.2214 230.345 68.1989C230.56 68.6097 230.585 69.4267 230.398 69.9208C229.979 71.0253 228.758 71.6065 227.52 71.29C226.677 71.0751 226.334 70.8421 225.317 69.7948C223.551 67.975 222.866 67.6222 220.319 67.2251L219.831 67.1489L220.386 66.6801L220.384 66.6774Z"
          fill="#FF007A"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M207.064 25.9174C212.963 33.077 222.058 44.2246 222.509 44.8484C222.882 45.3634 222.741 45.8268 222.103 46.1904C221.748 46.3926 221.018 46.5966 220.652 46.5966C220.239 46.5966 219.773 46.3971 219.434 46.0752C219.194 45.8476 218.226 44.4032 215.993 40.9367C214.283 38.2845 212.852 36.0847 212.813 36.0475C212.753 35.9907 213.755 37.8081 215.818 41.4998C217.761 44.9753 218.416 46.204 218.416 46.3681C218.416 46.7027 218.325 46.8777 217.913 47.3383C217.226 48.1054 216.918 48.9668 216.697 50.7495C216.449 52.748 215.75 54.1598 213.812 56.5763C212.677 57.9908 212.492 58.2501 212.206 58.8204C211.845 59.5386 211.746 59.9403 211.706 60.847C211.664 61.8055 211.746 62.4248 212.039 63.3415C212.296 64.144 212.563 64.6735 213.247 65.7335C213.837 66.6475 214.177 67.3275 214.177 67.5932C214.177 67.8045 214.217 67.8054 215.132 67.5987C217.322 67.1045 219.099 66.2349 220.099 65.1695C220.718 64.5103 220.864 64.1458 220.868 63.2417C220.871 62.6505 220.851 62.5263 220.69 62.1863C220.43 61.6332 219.957 61.1725 218.913 60.4589C217.546 59.5241 216.961 58.7715 216.8 57.736C216.667 56.8864 216.82 56.287 217.578 54.702C218.361 53.0608 218.555 52.3608 218.686 50.7069C218.771 49.6378 218.888 49.2162 219.195 48.878C219.515 48.5253 219.804 48.4056 220.596 48.2977C221.888 48.1208 222.712 47.7872 223.388 47.1633C223.975 46.6229 224.22 46.1015 224.258 45.3172L224.287 44.7224L223.959 44.3397C222.771 42.9551 206.269 24.8293 206.195 24.8293C206.18 24.8293 206.571 25.3189 207.064 25.9174ZM214.843 61.9315C215.111 61.4564 214.969 60.8452 214.519 60.546C214.095 60.264 213.436 60.3964 213.436 60.7645C213.436 60.8769 213.497 60.9586 213.638 61.0302C213.873 61.1517 213.89 61.2877 213.705 61.5661C213.517 61.8481 213.533 62.0956 213.747 62.2643C214.095 62.5354 214.585 62.3867 214.843 61.9315Z"
          fill="#FF007A"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M225.102 48.6078C224.495 48.7946 223.906 49.4374 223.723 50.1112C223.611 50.5228 223.674 51.2437 223.841 51.4667C224.111 51.8267 224.372 51.921 225.077 51.9165C226.459 51.9065 227.66 51.3144 227.799 50.5736C227.913 49.9661 227.387 49.1246 226.659 48.7556C226.285 48.5652 225.487 48.489 225.102 48.6078ZM226.717 49.8709C226.93 49.568 226.836 49.2407 226.474 49.0194C225.784 48.5978 224.741 48.9469 224.741 49.5988C224.741 49.9235 225.285 50.2771 225.784 50.2771C226.115 50.2771 226.57 50.0794 226.717 49.8709Z"
          fill="#FF007A"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M151.456 48.3137C152.237 47.5327 152.237 46.2663 151.456 45.4853C150.675 44.7042 149.408 44.7042 148.627 45.4853L142.97 51.1421L137.314 45.4853C136.533 44.7042 135.266 44.7042 134.485 45.4853C133.704 46.2663 133.704 47.5327 134.485 48.3137L140.142 53.9706L134.485 59.6274C133.704 60.4085 133.704 61.6748 134.485 62.4558C135.266 63.2369 136.533 63.2369 137.314 62.4558L142.97 56.799L148.627 62.4558C149.408 63.2369 150.675 63.2369 151.456 62.4558C152.237 61.6748 152.237 60.4085 151.456 59.6274L145.799 53.9706L151.456 48.3137Z"
        fill="#CACACA"
      />
      <defs>
        <filter
          id="filter0_d_4557_35793"
          x="0"
          y="0"
          width="108"
          height="108"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4557_35793" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_4557_35793"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_4557_35793"
          x="178"
          y="0"
          width="108"
          height="108"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4557_35793" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_4557_35793"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_d_4557_35793"
          x="178"
          y="0"
          width="108"
          height="108"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4557_35793" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_4557_35793"
            result="shape"
          />
        </filter>
        <radialGradient
          id="paint0_radial_4557_35793"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(18.2222 28.4444) rotate(40.8335) scale(91.1959 281.012)"
        >
          <stop stopColor="#FFCCEB" />
          <stop offset="0.473958" stopColor="#BFC6FF" />
          <stop offset="1" stopColor="#96E4D2" />
        </radialGradient>
        <radialGradient
          id="paint1_radial_4557_35793"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(18.2222 28.4444) rotate(40.8335) scale(91.1959 281.012)"
        >
          <stop stopColor="#FFCCEB" />
          <stop offset="0.473958" stopColor="#BFC6FF" />
          <stop offset="1" stopColor="#96E4D2" />
        </radialGradient>
        <linearGradient
          id="paint2_linear_4557_35793"
          x1="190.624"
          y1="9.51316"
          x2="229.068"
          y2="118.969"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDEEF3" />
          <stop offset="1" stopColor="#FFE6F5" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_4557_35793"
          x1="190.624"
          y1="9.51316"
          x2="229.068"
          y2="118.969"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDEEF3" />
          <stop offset="1" stopColor="#FFE6F5" />
        </linearGradient>
        <clipPath id="clip0_4557_35793">
          <rect
            width="42.6343"
            height="49.0939"
            fill="white"
            transform="translate(206.195 24.8293)"
          />
        </clipPath>
      </defs>
    </svg>
  </Box>
)

export function UniswapWidgetShowHide(props: { sxWrapper?: SxStyleProp }) {
  const { uiChanges } = useAppContext()

  const clickawayRef = useOutsideElementClickHandler(() =>
    uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, { type: 'close' }),
  )

  const [swapWidgetChange] = useObservable(
    uiChanges.subscribe<SwapWidgetState>(SWAP_WIDGET_CHANGE_SUBJECT),
  )

  useEffect(() => {
    if (swapWidgetChange?.isOpen && clickawayRef?.current) {
      const clientRect = clickawayRef.current.getBoundingClientRect()
      if (clientRect.bottom > window.innerHeight || clientRect.top < 0) {
        clickawayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [swapWidgetChange])

  if (swapWidgetChange && swapWidgetChange.isOpen) {
    return (
      <Box
        ref={clickawayRef}
        sx={{
          p: 0,
          position: 'absolute',
          top: 'auto',
          left: 'auto',
          right: '240px',
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
          ...props.sxWrapper,
        }}
      >
        <UniswapWidget token={swapWidgetChange.token} />
      </Box>
    )
  }

  return <></>
}

const tokenToTokenAddress = keyBy(tokenList.tokens, 'symbol')

export function UniswapWidget(props: { token?: string }) {
  const { web3ContextConnected$ } = useAppContext()

  const requestTokenAddress = props.token && tokenToTokenAddress[props.token]?.address

  const [web3Context] = useObservable(web3ContextConnected$)
  const [isOnboarded, setAsOnboarded] = useOnboarding('Exchange')
  const { t } = useTranslation()

  const web3Provider =
    web3Context?.status !== 'connectedReadonly' ? web3Context?.web3.currentProvider : null

  const { main, tokenSel, settings } = cssPaths

  if (!web3Provider) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '.subhead': { fontWeight: 'medium' },
        [main.swapBtn]: {
          border: '3px solid',
          borderColor: 'neutral20',
          ':hover': { borderColor: 'primary100', bg: 'neutral10' },
        },
        [main.token1Btn +
        '[color="interactive100"], ' +
        main.token2Btn +
        '[color="interactive100"]']: {
          border: '1px solid',
          borderColor: 'neutral20',
          ':hover': { borderColor: 'primary100', bg: 'neutral10' },
        },
        [tokenSel.hoverAppended]: { display: 'none' },
        [tokenSel.option]: {
          bg: 'transparent',
          ':hover': { bg: 'neutral20' },
          borderRadius: '8px',
          '.subhead': { fontWeight: 'semiBold' },
        },
        [tokenSel.search]: {
          borderColor: 'neutral20',
          borderRadius: 'medium',
          ':hover': { bg: 'neutral10' },
          ':focus': { borderColor: 'primary100' },
          '::placeholder': { color: 'neutral80' },
        },
        [tokenSel.scrollbar]: {
          '::-webkit-scrollbar-thumb': {
            background: scrollbarBg('#A8A9B1'),
            backgroundClip: 'padding-box',
          },
        },
        [settings.tooltip]: {
          display: 'block',
        },
      }}
      css={`
        ${main.token1Btn} > div > div, ${main.token2Btn} > div > div {
          font-size: 18px !important;
        }

        button[color=accent] {
          border-radius: 32px !important;
        }
      `}
    >
      {!isOnboarded && (
        <Flex
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: 'neutral10',
            zIndex: 'menu',
            borderRadius: 'mediumLarge',
            py: 4,
            px: 3,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Text variant="headerSettings" sx={{ mb: 2 }}>
              {t('exchange.onboarding.title')}
            </Text>
            <Text variant="paragraph3">
              <Trans
                i18nKey="exchange.onboarding.body"
                components={[<AppLink href={t('exchange.onboarding.faq-url')} />]}
              />
            </Text>
          </Box>
          <OnboardingGraphic />
          <Button sx={{ width: '100%' }} onClick={() => setAsOnboarded()}>
            {t('exchange.onboarding.button')}
          </Button>
        </Flex>
      )}
      <SwapWidget
        /* @ts-ignore */
        provider={web3Provider}
        theme={widgetTheme}
        tokenList={tokenList.tokens}
        convenienceFee={20}
        convenienceFeeRecipient="0xC7b548AD9Cf38721810246C079b2d8083aba8909"
        defaultInputTokenAddress={requestTokenAddress}
      />
    </Box>
  )
}
