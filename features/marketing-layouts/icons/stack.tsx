import { renderLinearGradientStops } from 'features/marketing-layouts/helpers'
import type { IconPalette } from 'features/marketing-layouts/types'

export function stack({
  backgroundGradient,
  foregroundGradient,
  symbolGradient,
}: IconPalette) {
  return (
    <>
      <circle cx="36" cy="36" r="33.5" fill="url(#paint1_linear_3327_31414)" />
      <circle cx="36" cy="36" r="33.5" stroke="white" />
      <g filter="url(#filter0_dd_3327_31414)">
        <rect x="16" y="16" width="40" height="40" rx="8" fill="url(#paint2_linear_3327_31414)" />
        <rect x="16.5" y="16.5" width="39" height="39" rx="7.5" stroke="white" />
      </g>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M27.9946 39.5084L34.7561 44.2208C35.4432 44.6997 36.356 44.6997 37.0432 44.2208L43.8037 39.5091L44.621 40.0787C45.192 40.4767 45.192 41.3216 44.621 41.7195L36.4704 47.4001C36.1268 47.6396 35.6704 47.6396 35.3268 47.4001L27.1763 41.7195C26.6053 41.3216 26.6053 40.4767 27.1763 40.0787L27.9946 39.5084Z"
        fill="url(#paint3_linear_3327_31414)"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M28.713 35.0089L34.7565 39.2209C35.4436 39.6998 36.3564 39.6998 37.0436 39.2209L43.0866 35.0092L44.622 36.0792C45.1929 36.4772 45.1929 37.3221 44.622 37.7201L36.4714 43.4006C36.1278 43.6401 35.6714 43.6401 35.3278 43.4006L27.1772 37.7201C26.6063 37.3221 26.6063 36.4772 27.1772 36.0792L28.713 35.0089Z"
        fill="url(#paint4_linear_3327_31414)"
      />
      <path
        d="M35.3276 25.3985C35.6712 25.159 36.1276 25.159 36.4712 25.3985L44.6218 31.0791C45.1927 31.477 45.1927 32.322 44.6218 32.7199L36.4712 38.4005C36.1276 38.6399 35.6712 38.6399 35.3276 38.4005L27.177 32.7199C26.6061 32.322 26.6061 31.477 27.177 31.0791L35.3276 25.3985Z"
        fill="url(#paint5_linear_3327_31414)"
      />
      <defs>
        <filter
          id="filter0_dd_3327_31414"
          x="0"
          y="0"
          width="72"
          height="72"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3327_31414" />
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
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_3327_31414"
            result="effect2_dropShadow_3327_31414"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_3327_31414"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint1_linear_3327_31414"
          x1="13.4126"
          y1="11.5105"
          x2="61.4406"
          y2="59.0629"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(backgroundGradient)}
        </linearGradient>
        <linearGradient
          id="paint2_linear_3327_31414"
          x1="22.7133"
          y1="21.5944"
          x2="50.965"
          y2="49.5664"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(foregroundGradient)}
        </linearGradient>
        <linearGradient
          id="paint3_linear_3327_31414"
          x1="29.3826"
          y1="39.8213"
          x2="32.9163"
          y2="49.7543"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(symbolGradient)}
        </linearGradient>
        <linearGradient
          id="paint4_linear_3327_31414"
          x1="29.3836"
          y1="35.3749"
          x2="33.2841"
          y2="45.742"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(symbolGradient)}
        </linearGradient>
        <linearGradient
          id="paint5_linear_3327_31414"
          x1="36.2727"
          y1="24.4769"
          x2="34.2309"
          y2="38.7693"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(symbolGradient)}
        </linearGradient>
      </defs>
    </>
  )
}
