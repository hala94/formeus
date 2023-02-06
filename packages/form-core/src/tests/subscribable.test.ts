import { describe, it, expect, beforeEach } from "vitest"
import { createSubscribable } from "../subscribable"

type Context = {
  subscribable: ReturnType<typeof createSubscribable<string>>
  testObject: {
    testValue: string | undefined
    [x: string]: string | undefined
  }
  unsub: () => void
}

beforeEach<Context>(async (context) => {
  const testObject = {
    testValue: undefined as string | undefined,
  }
  const subscribable = createSubscribable<string>()
  context.subscribable = subscribable
  context.unsub = subscribable.subscribe((e: string) => {
    testObject.testValue = e
  })
  context.testObject = testObject
})

describe.concurrent("subscribable", () => {
  it<Context>("publishes an event", ({ subscribable, testObject }) => {
    subscribable.publish("1")
    expect(testObject.testValue).toBe("1")
  })

  it<Context>("doesn't publish an event after unsub", ({
    subscribable,
    testObject,
    unsub,
  }) => {
    unsub()
    subscribable.publish("1")
    expect(testObject.testValue).toBeUndefined()
  })

  it<Context>("publishes to multiple subscribers", ({
    subscribable,
    testObject,
  }) => {
    testObject.testValue2 = undefined

    subscribable.subscribe((e: string) => {
      testObject.testValue2 = e
    })

    subscribable.publish("1")

    expect(testObject.testValue).toBe("1")
    expect(testObject.testValue2).toBe("1")
  })

  it<Context>("removes specific subscriber", ({
    subscribable,
    testObject,
    unsub,
  }) => {
    testObject.testValue2 = undefined
    subscribable.subscribe((e: string) => {
      testObject.testValue2 = e
    })

    unsub()

    subscribable.publish("1")

    expect(testObject.testValue2).toBe("1")
    expect(testObject.testValue).toBeUndefined()
  })
})
