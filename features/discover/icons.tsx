import type { IconProps } from 'components/Icon.types'
import { DiscoverPages } from 'features/discover/types'
import React from 'react'

type DiscoverJsxElementIconList = { [key in DiscoverPages]: JSX.Element }
type DiscoverComponentIconList = { [key in DiscoverPages]: IconProps['icon'] }

export const discoverNavigationIconContent: DiscoverJsxElementIconList = {
  [DiscoverPages.HIGHEST_RISK_POSITIONS]: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.2692 8.01518C16.6809 7.08106 15.3191 7.08106 14.7308 8.01518L7.05594 20.2006C6.42681 21.1995 7.14468 22.5 8.32517 22.5H23.6748C24.8553 22.5 25.5732 21.1995 24.944 20.2006L17.2692 8.01518ZM14.5 12.5C14.5 11.6716 15.1715 11 16 11C16.8284 11 17.5 11.6716 17.5 12.5V15.5C17.5 16.3284 16.8284 17 16 17C15.1715 17 14.5 16.3284 14.5 15.5V12.5ZM17.5 19.5C17.5 20.3284 16.8284 21 16 21C15.1715 21 14.5 20.3284 14.5 19.5C14.5 18.6716 15.1715 18 16 18C16.8284 18 17.5 18.6716 17.5 19.5Z"
      fill="white"
    />
  ),
  [DiscoverPages.HIGHEST_MULTIPLY_PNL]: (
    <>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.2317 11.7977C15.4332 11.445 15.9418 11.445 16.1433 11.7977L19.4335 17.5556L21.9257 14.0665C22.1632 13.734 22.6875 13.902 22.6875 14.3106V18V20V21.6C22.6875 22.3732 22.0607 23 21.2875 23H10.0875C9.3143 23 8.6875 22.3732 8.6875 21.6V20V18V14.3106C8.6875 13.902 9.21178 13.734 9.44927 14.0665L11.9415 17.5556L15.2317 11.7977Z"
        fill="white"
      />
      <circle r="1" transform="matrix(1 0 0 -1 15.5312 9.03123)" fill="white" />
      <circle opacity="0.8" cx="8.6875" cy="12" r="1" fill="white" />
      <circle opacity="0.8" cx="22.6875" cy="12" r="1" fill="white" />
    </>
  ),

  [DiscoverPages.MOST_YIELD_EARNED]: (
    <>
      <path
        d="M15.6658 8.476C15.8658 8.23034 16.241 8.23034 16.4411 8.476L21.4975 14.6842C21.7635 15.0109 21.5311 15.5 21.1098 15.5H10.9971C10.5758 15.5 10.3433 15.0109 10.6094 14.6842L15.6658 8.476Z"
        fill="white"
      />
      <rect opacity="0.8" x="14.0391" y="14" width="4.03053" height="10" rx="2" fill="white" />
    </>
  ),

  [DiscoverPages.LARGEST_DEBT]: (
    <>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.6682 11C10.8073 11 10.0431 11.5509 9.77083 12.3675L7.10417 20.3675C6.67248 21.6626 7.63642 23 9.00153 23H23.4518C24.8169 23 25.7809 21.6626 25.3492 20.3675L22.6825 12.3675C22.4103 11.5509 21.646 11 20.7852 11H11.6682ZM16.6959 14.2074V13.4141H16.0676V14.1938C15.8011 14.2161 15.5599 14.2739 15.344 14.3673C15.063 14.4899 14.843 14.6642 14.6839 14.8899C14.5249 15.1132 14.4454 15.3769 14.4454 15.6811C14.4454 16.0075 14.5196 16.2749 14.668 16.4835C14.8165 16.692 15.0232 16.8662 15.2883 17.0061C15.5534 17.1435 15.8609 17.276 16.2108 17.4035C16.3937 17.4722 16.5408 17.5422 16.6521 17.6133C16.7635 17.6845 16.843 17.7667 16.8907 17.8599C16.9411 17.9531 16.9662 18.0685 16.9662 18.2059C16.9662 18.3187 16.9424 18.4218 16.8947 18.515C16.847 18.6058 16.7741 18.6782 16.676 18.7321C16.5779 18.7861 16.4533 18.8131 16.3022 18.8131C16.1962 18.8131 16.0928 18.7984 15.9921 18.769C15.894 18.7395 15.8052 18.6917 15.7257 18.6254C15.6488 18.5567 15.5865 18.4659 15.5388 18.3531C15.4937 18.2378 15.4712 18.0942 15.4712 17.9225H14.2267C14.2267 18.2537 14.2863 18.5334 14.4056 18.7616C14.5249 18.9898 14.6853 19.1726 14.8867 19.31C15.0882 19.4474 15.3108 19.5467 15.5547 19.6081C15.6983 19.6424 15.8427 19.6667 15.9881 19.681V20.4141H16.6163V19.682C16.8658 19.6584 17.0925 19.6055 17.2963 19.5234C17.5852 19.4057 17.8092 19.2351 17.9682 19.0119C18.1299 18.7886 18.2108 18.5175 18.2108 18.1985C18.2108 17.8722 18.1352 17.606 17.9841 17.3999C17.8357 17.1913 17.6289 17.0159 17.3639 16.8736C17.0988 16.7288 16.7939 16.5914 16.4493 16.4614C16.2558 16.3853 16.1034 16.3105 15.9921 16.2369C15.8808 16.1633 15.8012 16.0823 15.7535 15.994C15.7085 15.9057 15.6859 15.8026 15.6859 15.6848C15.6859 15.5695 15.7071 15.4652 15.7495 15.372C15.792 15.2788 15.8596 15.2052 15.9523 15.1512C16.0451 15.0947 16.1644 15.0665 16.3102 15.0665C16.4109 15.0665 16.501 15.0837 16.5806 15.1181C16.6627 15.1524 16.7343 15.2052 16.7953 15.2763C16.8562 15.345 16.9026 15.4333 16.9344 15.5413C16.9662 15.6468 16.9821 15.7719 16.9821 15.9167H18.2267C18.2267 15.6419 18.1816 15.3978 18.0915 15.1843C18.0014 14.9684 17.8715 14.7868 17.7018 14.6396C17.5348 14.4924 17.3347 14.3795 17.1014 14.301C16.9738 14.2581 16.8386 14.2269 16.6959 14.2074Z"
        fill="white"
      />
      <path
        opacity="0.5"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.2261 11H20.2261C20.2261 8.79086 18.4352 7 16.2261 7C14.0169 7 12.2261 8.79086 12.2261 11H14.2261C14.2261 9.89543 15.1215 9 16.2261 9C17.3306 9 18.2261 9.89543 18.2261 11Z"
        fill="white"
      />
    </>
  ),
}

export const discoverBannerIcons: DiscoverComponentIconList = {
  [DiscoverPages.HIGHEST_RISK_POSITIONS]: {
    path: (
      <svg
        width="60"
        height="61"
        viewBox="0 0 60 61"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect y="0.259247" width="60" height="60" rx="8" fill="url(#paint0_linear_1020_8047)" />
        <g filter="url(#filter0_d_1020_8047)">
          <path
            d="M12.3988 20.9696C12.2413 20.0401 12.7362 19.1173 13.6041 18.7493L28.7774 12.3153C29.2764 12.1037 29.8399 12.1037 30.3389 12.3153L45.5122 18.7493C46.3801 19.1173 46.875 20.0401 46.7176 20.9696C46.219 23.9127 45.2351 30.3995 45.2351 35.7543C45.2351 42.5615 33.4198 47.8973 30.304 49.1861C29.8242 49.3846 29.2968 49.3709 28.8265 49.151C25.7323 47.7041 13.8812 41.7697 13.8812 35.7543C13.8813 30.3995 12.8973 23.9128 12.3988 20.9696Z"
            fill="#FFCCDE"
          />
          <path
            d="M14.6019 22.7272C14.433 21.7905 14.9254 20.8527 15.8006 20.4787L28.7718 14.9351C29.2738 14.7205 29.8417 14.7205 30.3438 14.9351L43.3149 20.4787C44.1901 20.8527 44.6825 21.7905 44.5136 22.7272C44.0431 25.3369 43.1953 30.6515 43.1953 35.0635C43.1953 40.7943 33.1474 45.3832 30.3011 46.5682C29.8221 46.7676 29.2989 46.7547 28.8291 46.5345C26.0027 45.2097 15.9202 40.1288 15.9203 35.0635C15.9203 30.6515 15.0724 25.3369 14.6019 22.7272Z"
            fill="#FF5F98"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M35.6112 26.261C36.0775 26.6513 36.1321 27.3375 35.7331 27.7936L28.8887 35.6197C28.6771 35.8617 28.3676 36.0007 28.042 36C27.7165 35.9993 27.4076 35.859 27.1971 35.6161L24.2637 32.2325C23.8668 31.7746 23.9245 31.0887 24.3925 30.7004C24.8605 30.3122 25.5616 30.3686 25.9585 30.8264L28.0482 33.2368L34.0446 26.3804C34.4435 25.9242 35.1449 25.8708 35.6112 26.261Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1020_8047"
            x="8.36975"
            y="9.15662"
            width="42.3768"
            height="45.1693"
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
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1020_8047" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1020_8047"
              result="shape"
            />
          </filter>
          <linearGradient
            id="paint0_linear_1020_8047"
            x1="3.01587"
            y1="1.24609"
            x2="28.088"
            y2="72.6306"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFE6F5" />
            <stop offset="1" stopColor="#FFF2F6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    viewBox: '0 0 60 60',
  },
  [DiscoverPages.HIGHEST_MULTIPLY_PNL]: {
    path: (
      <svg
        width="60"
        height="61"
        viewBox="0 0 60 61"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect y="0.259247" width="60" height="60" rx="8" fill="white" />
        <rect y="0.259247" width="60" height="60" rx="8" fill="url(#paint0_linear_1020_8063)" />
        <g filter="url(#filter0_d_1020_8063)">
          <g filter="url(#filter1_d_1020_8063)">
            <circle cx="30" cy="30.2592" r="16" fill="#575CFE" />
          </g>
          <path
            d="M35.9311 32.8811C37.2581 29.8894 36.1402 26.3168 33.2421 24.6436C31.8958 23.8662 30.3865 23.6266 28.963 23.8581L29.446 25.6605C30.4071 25.5439 31.4128 25.7266 32.3158 26.248C34.3266 27.4089 35.1376 29.8499 34.3137 31.9473L33.0765 31.233L33.4238 35.4446L37.2449 33.6397L35.9311 32.8811Z"
            fill="white"
          />
          <path
            d="M26.7579 35.8745C23.8598 34.2013 22.742 30.6288 24.069 27.637L22.7552 26.8785L26.5762 25.0735L26.9236 29.2851L25.6864 28.5708C24.8625 30.6682 25.6735 33.1092 27.6843 34.2701C28.5873 34.7915 29.593 34.9742 30.5541 34.8576L31.0371 36.66C29.6136 36.8915 28.1043 36.6519 26.7579 35.8745Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1020_8063"
            x="10"
            y="11.2592"
            width="40"
            height="40"
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
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1020_8063" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1020_8063"
              result="shape"
            />
          </filter>
          <filter
            id="filter1_d_1020_8063"
            x="10"
            y="10.2592"
            width="40"
            height="40"
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
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1020_8063" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1020_8063"
              result="shape"
            />
          </filter>
          <linearGradient
            id="paint0_linear_1020_8063"
            x1="0.793651"
            y1="0.259247"
            x2="26.104"
            y2="71.6192"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F0F3FD" />
            <stop offset="1" stopColor="#FCF0FD" />
          </linearGradient>
        </defs>
      </svg>
    ),
    viewBox: '0 0 60 60',
  },
  [DiscoverPages.MOST_YIELD_EARNED]: {
    path: (
      <svg
        width="60"
        height="61"
        viewBox="0 0 60 61"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect y="0.259247" width="60" height="60" rx="8" fill="white" />
        <rect y="0.259247" width="60" height="60" rx="8" fill="url(#paint0_linear_1028_8053)" />
        <circle cx="38" cy="30.2592" r="12" fill="url(#paint1_linear_1028_8053)" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M33.4488 24.6081H38.02C40.8005 24.6081 42.9081 26.1026 43.6922 28.2773H45.1162V29.5917H43.9921C44.0141 29.7994 44.0253 30.011 44.0253 30.226V30.2583C44.0253 30.5003 44.0111 30.7383 43.9833 30.9713H45.1162V32.2857H43.6651C42.8604 34.4302 40.769 35.9104 38.02 35.9104H33.4488V32.2857H31.8604V30.9713H33.4488V29.5917H31.8604V28.2773H33.4488V24.6081ZM34.7267 32.2857V34.7313H38.02C40.0522 34.7313 41.5621 33.7518 42.2649 32.2857H34.7267ZM42.6564 30.9713H34.7267V29.5917H42.6584C42.6878 29.8088 42.7028 30.0314 42.7028 30.2583V30.2906C42.7028 30.5227 42.6872 30.75 42.6564 30.9713ZM38.02 25.7853C40.0616 25.7853 41.5759 26.7906 42.2746 28.2773H34.7267V25.7853H38.02Z"
          fill="white"
        />
        <g filter="url(#filter0_d_1028_8053)">
          <path
            d="M22 42.2592C28.6274 42.2592 34 36.8867 34 30.2592C34 23.6318 28.6274 18.2592 22 18.2592C15.3726 18.2592 10 23.6318 10 30.2592C10 36.8867 15.3726 42.2592 22 42.2592Z"
            fill="url(#paint2_linear_1028_8053)"
          />
          <path d="M21.9999 23.0592V33.0051L17.2 30.3928L21.9999 23.0592Z" fill="white" />
          <path d="M21.9999 23.0592L26.7998 30.3928L21.9999 33.0051V23.0592Z" fill="white" />
          <path d="M21.9998 33.8422V37.4591L17.2 31.2312L21.9998 33.8422Z" fill="white" />
          <path d="M21.9998 37.4591V33.8422L26.8 31.2312L21.9998 37.4591Z" fill="white" />
        </g>
        <defs>
          <filter
            id="filter0_d_1028_8053"
            x="6"
            y="15.2592"
            width="32"
            height="32"
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
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1028_8053" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1028_8053"
              result="shape"
            />
          </filter>
          <linearGradient
            id="paint0_linear_1028_8053"
            x1="0.793651"
            y1="0.259247"
            x2="26.104"
            y2="71.6192"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F0F3FD" />
            <stop offset="1" stopColor="#FCF0FD" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_1028_8053"
            x1="38"
            y1="14.8592"
            x2="38"
            y2="44.7792"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F9A606" />
            <stop offset="1" stopColor="#FBCC5F" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_1028_8053"
            x1="10.8517"
            y1="30.2597"
            x2="33.8532"
            y2="48.2596"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6580EB" />
            <stop offset="1" stopColor="#8EA2F2" />
          </linearGradient>
        </defs>
      </svg>
    ),
    viewBox: '0 0 60 60',
  },
  [DiscoverPages.LARGEST_DEBT]: {
    path: (
      <svg
        width="60"
        height="61"
        viewBox="0 0 60 61"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect y="0.259247" width="60" height="60" rx="8" fill="url(#paint0_linear_1028_8019)" />
        <path
          opacity="0.3"
          d="M22.3333 16.2592H39.3333C47.0652 16.2592 53.3333 22.5273 53.3333 30.2592C53.3333 37.9912 47.0652 44.2592 39.3333 44.2592H22.3333V16.2592Z"
          fill="url(#paint1_linear_1028_8019)"
        />
        <path
          opacity="0.3"
          d="M22.3333 16.2592H32.3333C40.0652 16.2592 46.3333 22.5273 46.3333 30.2592C46.3333 37.9912 40.0652 44.2592 32.3333 44.2592H22.3333V16.2592Z"
          fill="url(#paint2_linear_1028_8019)"
        />
        <path
          opacity="0.3"
          d="M22.3333 16.2592H26.3333C34.0652 16.2592 40.3333 22.5273 40.3333 30.2592C40.3333 37.9912 34.0652 44.2592 26.3333 44.2592H22.3333V16.2592Z"
          fill="url(#paint3_linear_1028_8019)"
        />
        <circle cx="21" cy="30.2592" r="14" fill="url(#paint4_linear_1028_8019)" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.6903 23.6662H21.0234C24.2673 23.6662 26.7262 25.4098 27.641 27.947H29.3023V29.4804H27.9908C28.0165 29.7228 28.0296 29.9696 28.0296 30.2205V30.2581C28.0296 30.5405 28.013 30.8181 27.9806 31.09H29.3023V32.6235H27.6094C26.6705 35.1253 24.2306 36.8523 21.0234 36.8523H15.6903V32.6235H13.8372V31.09H15.6903V29.4804H13.8372V27.947H15.6903V23.6662ZM17.1812 32.6235V35.4766H21.0234C23.3943 35.4766 25.1558 34.3339 25.9758 32.6235H17.1812ZM26.4325 31.09H17.1812V29.4804H26.4349C26.4692 29.7337 26.4867 29.9934 26.4867 30.2581V30.2958C26.4867 30.5666 26.4684 30.8318 26.4325 31.09ZM21.0234 25.0396C23.4052 25.0396 25.172 26.2125 25.9871 27.947H17.1812V25.0396H21.0234Z"
          fill="white"
        />
        <defs>
          <linearGradient
            id="paint0_linear_1028_8019"
            x1="0"
            y1="0.259247"
            x2="39.0843"
            y2="61.9886"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FEF1E1" />
            <stop offset="1" stopColor="#FDF2CA" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_1028_8019"
            x1="37.8333"
            y1="12.2926"
            x2="37.8333"
            y2="47.1992"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F9A606" />
            <stop offset="1" stopColor="#FBCC5F" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_1028_8019"
            x1="34.3333"
            y1="12.2926"
            x2="34.3333"
            y2="47.1992"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F9A606" />
            <stop offset="1" stopColor="#FBCC5F" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_1028_8019"
            x1="31.3333"
            y1="12.2926"
            x2="31.3333"
            y2="47.1992"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F9A606" />
            <stop offset="1" stopColor="#FBCC5F" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_1028_8019"
            x1="21"
            y1="12.2926"
            x2="21"
            y2="47.1992"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F9A606" />
            <stop offset="1" stopColor="#FBCC5F" />
          </linearGradient>
        </defs>
      </svg>
    ),
    viewBox: '0 0 60 60',
  },
}
