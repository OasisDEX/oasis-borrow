import React from 'react'
import { Box } from 'theme-ui'

import { fadeOut } from './keyframes'

const pathTransform: React.CSSProperties = {
  transform: 'scale(1, -1) translateY(-60%)',
}

export function BackgroundLight() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '-300px',
        left: 'calc((100% - 1882px) / 2)',
        right: 0,
        zIndex: -1,
        overflow: 'hidden',
        backgroundColor: 'white',
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
        '&::before': {
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          content: '""',
          background: 'white',
          opacity: 0.3,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          userSelect: 'none',
          pointerEvents: 'none',
          overflow: 'hidden',
          maxHeight: 'calc(100vh + 300px)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1882"
          height="1517"
          fill="none"
          viewBox="0 0 1882 1517"
        >
          <circle cx="1387" cy="619.782" r="379" fill="url(#paint0_radial)"></circle>
          <g filter="url(#filter0_f)">
            <circle cx="533" cy="617.782" r="379" fill="url(#paint1_radial)"></circle>
          </g>
          <g filter="url(#filter1_f)">
            <circle cx="1025" cy="447.782" r="379" fill="url(#paint2_radial)"></circle>
          </g>
          <circle cx="979.001" cy="603.783" r="379" fill="url(#paint3_radial)"></circle>
          <g
            style={{ mixBlendMode: 'overlay', transform: 'translateY(250px)' }}
            filter="url(#filter2_b)"
            opacity="0.3"
          >
            <path
              style={pathTransform}
              className="layerTop"
              fill="url(#paint4_linear)"
              d="M1882 557.283c0 195.785-614 530.497-873 354.499-259-176-873-158.714-873-354.499 0-195.785 425-588.5 873-354.5 362 294 873 158.715 873 354.5z"
            ></path>
          </g>
          <g
            style={{ mixBlendMode: 'overlay', transform: 'translateY(250px)' }}
            filter="url(#filter3_b)"
            opacity="0.3"
          >
            <path
              style={pathTransform}
              className="layerMiddle"
              fill="url(#paint5_linear)"
              d="M1641 612.783c0 195.694-105.19 119.921-386.59 149.907C760.813 815.289 26.996 636.749 54.766 303.404c0-195.695 368.411-266.377 768.293-54.475C1254.43 546.791 1641 417.089 1641 612.783z"
            ></path>
          </g>
          <g
            style={{ mixBlendMode: 'overlay', transform: 'translateY(250px)' }}
            filter="url(#filter4_b)"
            opacity="0.3"
          >
            <path
              style={pathTransform}
              className="layerBottom"
              fill="url(#paint6_linear)"
              d="M214.428 402.902C56.491 218.35-80.869-16.385 57.428.902c231.148 28.893 288 352 553 338 171.167-9.043 550.432 9.149 885.002 135.881 132 50 229.91 108 197.57 226s-615-77.881-803-23c-209.013 61.015-561-141-675.572-274.881z"
            ></path>
          </g>
          <defs>
            <filter
              id="filter0_f"
              width="798"
              height="798"
              x="134"
              y="218.782"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
              <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="10"></feGaussianBlur>
            </filter>
            <filter
              id="filter1_f"
              width="798"
              height="798"
              x="626.001"
              y="48.782"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
              <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="10"></feGaussianBlur>
            </filter>
            <filter
              id="filter2_b"
              width="1866"
              height="950.739"
              x="76"
              y="70.565"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feGaussianBlur in="BackgroundImage" stdDeviation="30"></feGaussianBlur>
              <feComposite
                in2="SourceAlpha"
                operator="in"
                result="effect1_backgroundBlur"
              ></feComposite>
              <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape"></feBlend>
            </filter>
            <filter
              id="filter3_b"
              width="1707"
              height="772"
              x="-6"
              y="59.783"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feGaussianBlur in="BackgroundImage" stdDeviation="30"></feGaussianBlur>
              <feComposite
                in2="SourceAlpha"
                operator="in"
                result="effect1_backgroundBlur"
              ></feComposite>
              <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape"></feBlend>
            </filter>
            <filter
              id="filter4_b"
              width="1818.78"
              height="859.31"
              x="-59.563"
              y="-60"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feGaussianBlur in="BackgroundImage" stdDeviation="30"></feGaussianBlur>
              <feComposite
                in2="SourceAlpha"
                operator="in"
                result="effect1_backgroundBlur"
              ></feComposite>
              <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape"></feBlend>
            </filter>
            <radialGradient
              id="paint0_radial"
              cx="0"
              cy="0"
              r="1"
              gradientTransform="matrix(0 379 -379 0 1387 619.782)"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#BFFFF0"></stop>
              <stop offset="1" stopColor="#FEFFC7" stopOpacity="0"></stop>
            </radialGradient>
            <radialGradient
              id="paint1_radial"
              cx="0"
              cy="0"
              r="1"
              gradientTransform="matrix(0 379 -379 0 533 617.782)"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#EAE2FF"></stop>
              <stop offset="1" stopColor="#FFC8CE" stopOpacity="0"></stop>
            </radialGradient>
            <radialGradient
              id="paint2_radial"
              cx="0"
              cy="0"
              r="1"
              gradientTransform="matrix(0 379 -379 0 1025 447.782)"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#EAE2FF"></stop>
              <stop offset="1" stopColor="#FFC8CE" stopOpacity="0"></stop>
            </radialGradient>
            <radialGradient
              id="paint3_radial"
              cx="0"
              cy="0"
              r="1"
              gradientTransform="matrix(0 379 -379 0 979.001 603.783)"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFF8E0"></stop>
              <stop offset="1" stopColor="#D3EFFF" stopOpacity="0"></stop>
            </radialGradient>
            <linearGradient
              id="paint4_linear"
              x1="479.479"
              x2="1671.58"
              y1="295.749"
              y2="941.718"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#141414"></stop>
              <stop offset="1"></stop>
            </linearGradient>
            <linearGradient
              id="paint5_linear"
              x1="372.709"
              x2="1281.03"
              y1="41.991"
              y2="738.34"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#141414"></stop>
              <stop offset="1"></stop>
            </linearGradient>
            <linearGradient
              id="paint6_linear"
              x1="229"
              x2="1617"
              y1="206.783"
              y2="656.783"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#141414"></stop>
              <stop offset="1" stopOpacity="0.57"></stop>
            </linearGradient>
          </defs>
        </svg>
      </Box>
    </Box>
  )
}
