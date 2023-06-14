import React from 'react'
import { Box } from 'theme-ui'

import { fadeOut } from './keyframes'

export const backgroundSize = {
  width: 1440,
  height: 845,
}

export function Background({ short = false }: { short?: boolean }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: short ? '-650px' : '0',
        right: 0,
        zIndex: -1,
        backgroundColor: 'white',
        overflow: 'hidden',
        height: `${backgroundSize.height}px`,
        ...(short && { transform: 'scaleY(-1)' }),
        '&::after': {
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          content: '""',
          background: 'white',
          opacity: 1,
          animation: fadeOut,
          animationDuration: '0.4s',
          animationDelay: '0.1s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
        },
      }}
    >
      <Box
        sx={{
          userSelect: 'none',
          pointerEvents: 'none',
          maxHeight: short ? `calc(100vh + 650px)` : `${backgroundSize.height}px`,
          '& > svg': {
            left: 0,
            '@media screen and (max-width: 1440px)': {
              left: `calc(((${backgroundSize.width}px - 100vw) / 2) * -1)`,
            },
          },
        }}
      >
        <svg
          style={{
            position: 'absolute',
            bottom: 0,
            minWidth: '100%',
            minHeight: '100%',
          }}
          viewBox={`0 0 ${backgroundSize.width} ${backgroundSize.height}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_1370_18987)">
            <g opacity="0.5" filter="url(#filter0_f_1370_18987)">
              <circle cx="684" cy="496" r="804" fill="url(#paint0_linear_1370_18987)" />
            </g>
            <g filter="url(#filter1_d_1370_18987)">
              <circle
                opacity="0.1"
                cx="674"
                cy="674"
                r="673.5"
                transform="matrix(-4.37114e-08 1 1 4.37114e-08 46 323)"
                fill="url(#paint1_linear_1370_18987)"
                stroke="white"
              />
              <circle
                opacity="0.3"
                cx="493"
                cy="493"
                r="492.5"
                transform="matrix(-4.37114e-08 1 1 4.37114e-08 227 504)"
                fill="url(#paint2_linear_1370_18987)"
                stroke="white"
              />
              <circle
                cx="292"
                cy="292"
                r="291.5"
                transform="matrix(-4.37114e-08 1 1 4.37114e-08 428 705)"
                fill="url(#paint3_linear_1370_18987)"
                stroke="white"
              />
            </g>
          </g>
          <defs>
            <filter
              id="filter0_f_1370_18987"
              x="-320"
              y="-508"
              width="2008"
              height="2008"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_1370_18987" />
            </filter>
            <filter
              id="filter1_d_1370_18987"
              x="42"
              y="323"
              width="1356"
              height="1356"
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
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1370_18987"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1370_18987"
                result="shape"
              />
            </filter>
            <linearGradient
              id="paint0_linear_1370_18987"
              x1="933.817"
              y1="1237.96"
              x2="-319.152"
              y2="24.9678"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FA935C" />
              <stop offset="0.348958" stopColor="#FFEEE2" />
              <stop offset="0.682292" stopColor="#ABE7FB" />
              <stop offset="1" stopColor="#087FA2" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_1370_18987"
              x1="517.041"
              y1="-0.000257983"
              x2="507.808"
              y2="1348"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#007DA3" />
              <stop offset="0.302083" stopColor="#19B3D2" />
              <stop offset="0.686655" stopColor="#FFDCC6" />
              <stop offset="1" stopColor="#E97047" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_1370_18987"
              x1="378.192"
              y1="-0.000188702"
              x2="371.438"
              y2="986"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#007DA3" />
              <stop offset="0.302083" stopColor="#19B3D2" />
              <stop offset="0.686655" stopColor="#FFDCC6" />
              <stop offset="1" stopColor="#E97047" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_1370_18987"
              x1="224"
              y1="-0.000111767"
              x2="220"
              y2="584"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#007DA3" />
              <stop offset="0.302083" stopColor="#19B3D2" />
              <stop offset="0.686655" stopColor="#FFDCC6" />
              <stop offset="1" stopColor="#E97047" />
            </linearGradient>
            <clipPath id="clip0_1370_18987">
              <rect
                width={backgroundSize.width}
                height={backgroundSize.height}
                fill="white"
                transform="translate(-2)"
              />
            </clipPath>
          </defs>
        </svg>
      </Box>
    </Box>
  )
}
