import { renderLinearGradientStops } from 'features/marketing-layouts/helpers'
import type { MarketingLayoutIconPalette } from 'features/marketing-layouts/types'

export function loop({ backgroundGradient, symbolGradient }: MarketingLayoutIconPalette) {
  return (
    <>
      <circle cx="28" cy="28.0001" r="27.5" fill="url(#paint0_linear_3327_28417)" stroke="white" />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M32.1595 14.8478C32.8243 15.0807 33.0464 15.9095 32.5871 16.4436L28.2649 21.4698C27.741 22.079 26.7488 21.8528 26.5408 21.0766L25.9824 18.9925C24.1732 19.4316 22.4592 20.3575 21.0461 21.7706C16.9456 25.8711 16.9456 32.5193 21.0461 36.6198C25.1466 40.7204 31.7948 40.7204 35.8953 36.6198C37.513 35.0022 38.4908 32.9921 38.8328 30.8967C39.0993 29.2643 38.9794 27.5814 38.4742 25.9963C38.2226 25.207 38.6585 24.3632 39.4478 24.1116C40.2371 23.86 41.0809 24.2959 41.3325 25.0852C41.9823 27.1238 42.1357 29.2845 41.7937 31.3799C41.3538 34.0752 40.0934 36.6644 38.0166 38.7412C32.7446 44.0132 24.1968 44.0132 18.9248 38.7412C13.6527 33.4691 13.6527 24.9214 18.9248 19.6493C20.7232 17.8509 22.9045 16.6656 25.2058 16.0942L24.6068 13.8587C24.3988 13.0825 25.1449 12.3904 25.9033 12.6561L32.1595 14.8478Z"
        fill="url(#paint1_linear_3327_28417)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3327_28417"
          x1="9.3986"
          y1="7.83223"
          x2="48.951"
          y2="46.9931"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(backgroundGradient)}
        </linearGradient>
        <linearGradient
          id="paint1_linear_3327_28417"
          x1="18.8576"
          y1="15.796"
          x2="37.949"
          y2="38.632"
          gradientUnits="userSpaceOnUse"
        >
          {renderLinearGradientStops(symbolGradient)}
        </linearGradient>
      </defs>
    </>
  )
}
