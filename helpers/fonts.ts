import localFont from '@next/font/local'

export const FTPolar = localFont({
  src: [
    {
      path: '../public/static/fonts/FTPolar/FTPolarTrial-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/static/fonts/FTPolar/FTPolarTrial-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  display: 'block',
})
