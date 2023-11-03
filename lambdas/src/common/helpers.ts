export const getDefaultErrorMessage = (error: any): string => {
  if (error && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Unknown error'
}
