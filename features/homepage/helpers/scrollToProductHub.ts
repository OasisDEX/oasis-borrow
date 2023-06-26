export function scrollToProductHub() {
  const scrollY = document.body.scrollTop
  const productHubY = document.querySelector('#product-hub')?.getBoundingClientRect().top || 0
  const safetyMargin = 48

  document
    .querySelector('body')
    ?.scrollTo({ top: scrollY + productHubY - safetyMargin, behavior: 'smooth' })
}
