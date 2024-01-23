import { renderLinearGradientStops } from 'features/marketing-layouts/helpers'
import type { MarketingLayoutIconPalette } from 'features/marketing-layouts/types'

export function sleep({
  backgroundGradient,
  foregroundGradient,
  symbolGradient,
}: MarketingLayoutIconPalette) {
  return (
    <>
      <circle cx="40" cy="40" r="33.5" fill="url(#paint1_linear_4087_1130)" />
      <circle cx="40" cy="40" r="33.5" stroke="white" />
      <g filter="url(#filter0_d_4087_1130)">
        <circle cx="40" cy="40" r="24" fill="url(#paint2_linear_4087_1130)" />
        <circle cx="40" cy="40" r="23.5" stroke="white" />
      </g>
      <g filter="url(#filter1_d_4087_1130)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M47.2833 48.2382C47.1891 48.2406 47.0947 48.2418 47 48.2418C40.9249 48.2418 36 43.3169 36 37.2418C36 34.4702 37.025 31.938 38.7167 30.0037C32.7725 30.1539 28 35.0197 28 41.0001C28 47.0752 32.9249 52.0001 39 52.0001C42.3035 52.0001 45.2669 50.5438 47.2833 48.2382Z"
          fill="url(#paint3_linear_4087_1130)"
        />
      </g>
      <path
        d="M51.6491 28.6417C51.8008 28.3643 52.1992 28.3643 52.3509 28.6417L53.0044 29.8366C53.0412 29.9037 53.0963 29.9588 53.1634 29.9956L54.3583 30.6491C54.6357 30.8008 54.6357 31.1992 54.3583 31.3509L53.1634 32.0044C53.0963 32.0412 53.0412 32.0963 53.0044 32.1634L52.3509 33.3583C52.1992 33.6357 51.8008 33.6357 51.6491 33.3583L50.9956 32.1634C50.9588 32.0963 50.9037 32.0412 50.8366 32.0044L49.6417 31.3509C49.3643 31.1992 49.3643 30.8008 49.6417 30.6491L50.8366 29.9956C50.9037 29.9588 50.9588 29.9037 50.9956 29.8366L51.6491 28.6417Z"
        fill="url(#paint4_linear_4087_1130)"
      />
      <path
        d="M47.6491 35.6417C47.8008 35.3643 48.1992 35.3643 48.3509 35.6417L49.358 37.483C49.3947 37.5501 49.4499 37.6053 49.517 37.642L51.3583 38.6491C51.6357 38.8008 51.6357 39.1992 51.3583 39.3509L49.517 40.358C49.4499 40.3947 49.3947 40.4499 49.358 40.517L48.3509 42.3583C48.1992 42.6357 47.8008 42.6357 47.6491 42.3583L46.642 40.517C46.6053 40.4499 46.5501 40.3947 46.483 40.358L44.6417 39.3509C44.3643 39.1992 44.3643 38.8008 44.6417 38.6491L46.483 37.642C46.5501 37.6053 46.6053 37.5501 46.642 37.483L47.6491 35.6417Z"
        fill="url(#paint5_linear_4087_1130)"
      />
      <defs>
        <filter
          id="filter0_d_4087_1130"
          x="0"
          y="0"
          width="80"
          height="80"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4087_1130" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_4087_1130"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_4087_1130"
          x="12"
          y="14.0037"
          width="51.2832"
          height="53.9963"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4087_1130" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_4087_1130"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint1_linear_4087_1130"
          x1="17.4126"
          y1="15.5105"
          x2="65.4406"
          y2="63.0629"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(backgroundGradient)}
        </linearGradient>
        <linearGradient
          id="paint2_linear_4087_1130"
          x1="24.0559"
          y1="22.7133"
          x2="57.958"
          y2="56.2797"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(foregroundGradient)}
        </linearGradient>
        <linearGradient
          id="paint3_linear_4087_1130"
          x1="30.776"
          y1="32.3408"
          x2="44.7825"
          y2="48.7126"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(symbolGradient)}
        </linearGradient>
        <linearGradient
          id="paint4_linear_4087_1130"
          x1="49.8637"
          y1="28.6375"
          x2="53.5762"
          y2="33.5875"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(symbolGradient)}
        </linearGradient>
        <linearGradient
          id="paint5_linear_4087_1130"
          x1="45.1517"
          y1="35.85"
          x2="50.1017"
          y2="42.45"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(symbolGradient)}
        </linearGradient>
      </defs>
    </>
  )
}
