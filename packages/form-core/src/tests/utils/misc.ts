export const delayResult = <T>(value: T, delay: number = 3000) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, delay)
  })
}
