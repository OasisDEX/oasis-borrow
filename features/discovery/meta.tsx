import { getToken } from 'blockchain/tokensMetadata'
import { DiscoveryPages } from 'features/discovery/types'
import React from 'react'

export interface DiscoveryFiltersListItem {
  label: string
  value: string
  icon?: string
}
export interface DiscoveryFiltersList {
  [key: string]: DiscoveryFiltersListItem[]
}
export interface DiscoveryPageMeta {
  kind: DiscoveryPages
  id: string
  endpoint: string
  iconColor: string
  iconContent: JSX.Element
  filters: DiscoveryFiltersList
}

export const discoveryPagesMeta: DiscoveryPageMeta[] = [
  {
    kind: DiscoveryPages.HIGH_RISK_POSITIONS,
    id: 'high-risk-positions',
    endpoint: '/high-risk-positions.json',
    iconColor: '#FE665C',
    iconContent: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.2692 8.01518C16.6809 7.08106 15.3191 7.08106 14.7308 8.01518L7.05594 20.2006C6.42681 21.1995 7.14468 22.5 8.32517 22.5H23.6748C24.8553 22.5 25.5732 21.1995 24.944 20.2006L17.2692 8.01518ZM14.5 12.5C14.5 11.6716 15.1715 11 16 11C16.8284 11 17.5 11.6716 17.5 12.5V15.5C17.5 16.3284 16.8284 17 16 17C15.1715 17 14.5 16.3284 14.5 15.5V12.5ZM17.5 19.5C17.5 20.3284 16.8284 21 16 21C15.1715 21 14.5 20.3284 14.5 19.5C14.5 18.6716 15.1715 18 16 18C16.8284 18 17.5 18.6716 17.5 19.5Z"
        fill="white"
      />
    ),
    filters: {
      asset: [
        { value: 'all', label: 'All asset' },
        { value: 'eth', label: 'ETH', icon: getToken('ETH').iconCircle },
        { value: 'dai', label: 'DAI', icon: getToken('DAI').iconCircle },
        { value: 'wbtc', label: 'WBTC', icon: getToken('WBTC').iconCircle },
      ],
      value: [
        { value: '>100k', label: 'Over $100' },
        { value: '75k-100k', label: '$75,000 - $100,000' },
        { value: '50k-75k', label: '$50,000 - $75,000' },
        { value: '<50k', label: 'Below $50,000' },
      ],
    },
  },
  {
    kind: DiscoveryPages.HIGHEST_MULTIPLY_PNL,
    id: 'highest-multiply-pnl',
    endpoint: '/highest-multiply-pnl.json',
    iconColor: '#FFC700',
    iconContent: (
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
    filters: {},
  },
  {
    kind: DiscoveryPages.MOST_YIELD_EARNED,
    id: 'most-yield-earned',
    endpoint: '/most-yield-earned.json',
    iconColor: '#00E2BA',
    iconContent: (
      <>
        <path
          d="M15.6658 8.476C15.8658 8.23034 16.241 8.23034 16.4411 8.476L21.4975 14.6842C21.7635 15.0109 21.5311 15.5 21.1098 15.5H10.9971C10.5758 15.5 10.3433 15.0109 10.6094 14.6842L15.6658 8.476Z"
          fill="white"
        />
        <rect opacity="0.8" x="14.0391" y="14" width="4.03053" height="10" rx="2" fill="white" />
      </>
    ),
    filters: {},
  },
  {
    kind: DiscoveryPages.LARGEST_DEBT,
    id: 'largest-debt',
    endpoint: '/largest-debt.json',
    iconColor: '#FF4DB8',
    iconContent: (
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
    filters: {},
  },
]
