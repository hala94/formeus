type TListener<TMessage> = (message: TMessage) => void

export function createSubscribable<TEvent>() {
  const listeners = new Set<TListener<TEvent>>()

  return {
    subscribe: (cb: TListener<TEvent>) => {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    unsubscribe: (cb: TListener<TEvent>) => {
      listeners.delete(cb)
    },
    publish: (event: TEvent) => {
      listeners.forEach((cb) => cb(event))
    },
  }
}
