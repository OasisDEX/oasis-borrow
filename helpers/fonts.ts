import localFont from 'next/font/local'

export const FTPolar = localFont({
  src: [
    {
      path: '../public/static/fonts/FTPolar/ftpolar-bold.woff2',
      weight: '700',
    },
    {
      path: '../public/static/fonts/FTPolar/ftpolar-medium.woff2',
      weight: '500',
    },
  ],
  display: 'block',
})

export const Inter = localFont({
  src: [
    {
      path: '../public/static/fonts/Inter/Inter-Bold.woff2',
      weight: '700',
    },
    {
      path: '../public/static/fonts/Inter/Inter-SemiBold.woff2',
      weight: '600',
    },
    {
      path: '../public/static/fonts/Inter/Inter-Regular.woff2',
      weight: '400',
    },
  ],
  display: 'block',
})
