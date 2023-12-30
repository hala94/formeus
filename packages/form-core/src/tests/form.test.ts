import { createForm } from "../form"
import { describe, expect, it, vi } from "vitest"
import {
  createClientValidator,
  createServerValidator,
} from "./utils/formTestUtils"
import { FormResult } from "../types"
import { delayResult } from "./utils/misc"

describe("form", () => {
  it("correctly updates results", () => {
    const form = createForm({ initial: { email: "", username: "" } })
    const { update } = form.getSnapshot()

    update("email", "test@test.com")
    update("username", "123")

    const snapshot = form.getSnapshot()
    expect(snapshot.values.email).toBe("test@test.com")
    expect(snapshot.values.username).toBe("123")
    expect(snapshot.isValid).toBeTruthy()
    expect(snapshot.isValidating).toBeFalsy()
  })

  it("has correct state after running client validations", async () => {
    const initial = {
      email: "",
      username: "",
      password: "",
      note: "",
    }
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res) => {
        const form = createForm({
          initial,
          validators: {
            ...createClientValidator("passing", "email"),
            ...createClientValidator("failing", "username"),
            ...createClientValidator("throws", "password"),
            ...createClientValidator("resolves_with_unsupported_type", "note"),
          },
        })
        const { runValidation } = form.getSnapshot()

        runValidation("email")
        runValidation("username")
        runValidation("password")
        runValidation("note")

        setTimeout(() => {
          res(form.getSnapshot())
        }, 0)
      })

    const result = await promise()

    expect(result.validations.email).toStrictEqual({
      checked: true,
      error: undefined,
      validating: false,
    })

    expect(result.validations.username).toStrictEqual({
      checked: true,
      error: new Error("username invalid"),
      validating: false,
    })

    expect(result.validations.password).toStrictEqual({
      checked: true,
      error: new Error("password throw"),
      validating: false,
    })

    expect(result.validations.note).toStrictEqual({
      checked: true,
      error: undefined,
      validating: false,
    })
  })

  it("field validation error is cleared after update", async () => {
    const form = createForm({
      initial: {
        email: "",
      },
      validators: {
        ...createClientValidator("failing", "email"),
      },
    })

    const snapshot1 = form.getSnapshot()
    snapshot1.runValidation("email")

    const snapshot2 = form.getSnapshot()

    expect(snapshot2.validations.email).toStrictEqual({
      checked: true,
      error: new Error("email invalid"),
      validating: false,
    })

    snapshot2.update("email", "newInvalidMail")

    const snapshot3 = form.getSnapshot()

    expect(snapshot3.validations.email).toStrictEqual({
      checked: false,
      error: undefined,
      validating: false,
    })
  })

  it("field validation error is not cleared after update if flag is set", async () => {
    const form = createForm({
      initial: {
        email: "",
      },
      validators: {
        ...createClientValidator("failing", "email"),
      },
      config: {
        preserveValidationErrorOnUpdate: true,
      },
    })

    const snapshot1 = form.getSnapshot()
    snapshot1.runValidation("email")

    const snapshot2 = form.getSnapshot()

    expect(snapshot2.validations.email).toStrictEqual({
      checked: true,
      error: new Error("email invalid"),
      validating: false,
    })

    snapshot2.update("email", "newInvalidMail")

    const snapshot3 = form.getSnapshot()

    expect(snapshot3.validations.email).toStrictEqual({
      checked: false,
      error: new Error("email invalid"),
      validating: false,
    })
  })

  it("has correct state after running server validations", async () => {
    const initial = {
      email: "",
      username: "",
      password: "",
      note: "",
    }
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res) => {
        const form = createForm({
          initial,
          asyncValidators: {
            ...createServerValidator("passing", "email"),
            ...createServerValidator("failing", "username"),
            ...createServerValidator("throws", "password"),
            ...createServerValidator("resolves_with_unsupported_type", "note"),
          },
        })
        const { runValidation } = form.getSnapshot()

        runValidation("email")
        runValidation("username")
        runValidation("password")
        runValidation("note")

        setTimeout(() => {
          res(form.getSnapshot())
        }, 15)
      })

    const result = await promise()

    expect(result.validations.email).toStrictEqual({
      checked: true,
      error: undefined,
      validating: false,
    })

    expect(result.validations.username).toStrictEqual({
      checked: true,
      error: new Error("username invalid"),
      validating: false,
    })

    expect(result.validations.password).toStrictEqual({
      checked: true,
      error: new Error("password throw"),
      validating: false,
    })

    expect(result.validations.note).toStrictEqual({
      checked: true,
      error: undefined,
      validating: false,
    })
  })

  it("has correct state after running both client and server validations", async () => {
    const initial = {
      email: "",
      username: "",
      password: "",
      note: "",
    }
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res) => {
        const form = createForm({
          initial,
          validators: {
            ...createClientValidator("passing", "email"),
            ...createClientValidator("failing", "username"),
            ...createClientValidator("throws", "password"),
            ...createClientValidator("resolves_with_unsupported_type", "note"),
          },
          asyncValidators: {
            ...createServerValidator("passing", "email"),
            ...createServerValidator("failing", "username"),
            ...createServerValidator("throws", "password"),
            ...createServerValidator("resolves_with_unsupported_type", "note"),
          },
        })
        const { runValidation } = form.getSnapshot()

        runValidation("email")
        runValidation("username")
        runValidation("password")
        runValidation("note")

        setTimeout(() => {
          res(form.getSnapshot())
        }, 20)
      })

    const result = await promise()

    expect(result.validations.email).toStrictEqual({
      checked: true,
      error: undefined,
      validating: false,
    })

    expect(result.validations.username).toStrictEqual({
      checked: true,
      error: new Error("username invalid"),
      validating: false,
    })

    expect(result.validations.password).toStrictEqual({
      checked: true,
      error: new Error("password throw"),
      validating: false,
    })

    expect(result.validations.note).toStrictEqual({
      checked: true,
      error: undefined,
      validating: false,
    })
  })

  it("failing client validator stops server validator from running", async () => {
    const initial = {
      email: "",
      username: "",
    }
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res) => {
        const form = createForm({
          initial,
          validators: {
            ...createClientValidator("failing", "email"),
          },
          asyncValidators: {
            ...createServerValidator("passing", "email"),
          },
        })
        const { runValidation } = form.getSnapshot()

        runValidation("email")

        setTimeout(() => {
          res(form.getSnapshot())
        }, 15)
      })

    const { validations } = await promise()

    expect(validations.email).toStrictEqual({
      checked: true,
      error: new Error("email invalid"),
      validating: false,
    })
  })

  it("has correct state indicating validation in progress", async () => {
    const initial = {
      email: "",
      username: "",
    }
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res) => {
        const form = createForm({
          initial,
          asyncValidators: {
            ...createServerValidator("passing", "email"),
          },
        })
        const { runValidation } = form.getSnapshot()

        runValidation("email")

        setTimeout(() => {
          res(form.getSnapshot())
        })
      })

    const { validations, isValid, isValidating } = await promise()

    expect(validations.email).toStrictEqual({
      checked: false,
      error: undefined,
      validating: true,
    })
    expect(isValid).toBeFalsy()
    expect(isValidating).toBeTruthy()
  })

  it("calls submit handler if all fields valid", async () => {
    const initial = {
      email: "",
      username: "",
    }

    const formProps = {
      initial,
      validators: {
        ...createClientValidator("passing", "email"),
        ...createClientValidator("passing", "username"),
      },
      asyncValidators: {
        ...createServerValidator("passing", "email"),
      },
      onSubmitForm: () => {
        return
      },
    }

    const submitSpy = vi.spyOn(formProps, "onSubmitForm")

    const promise = () =>
      new Promise<{
        result: FormResult<typeof initial>
      }>((res) => {
        const form = createForm(formProps)
        const { submit } = form.getSnapshot()

        submit()

        setTimeout(() => {
          res({ result: form.getSnapshot() })
        }, 50)
      })

    const { result } = await promise()

    expect(submitSpy).toHaveBeenCalledOnce()
    expect(result.validations.email).toStrictEqual({
      checked: true,
      error: undefined,
      validating: false,
    })
  })

  it("doesn't call submit handler if some validations fail", async () => {
    const initial = {
      email: "",
      username: "",
    }

    const mockOnSubmitForm = vi.fn()

    const promise = () =>
      new Promise<{
        result: FormResult<typeof initial>
      }>((res) => {
        const formProps = {
          initial,
          validators: {
            ...createClientValidator("passing", "email"),
            ...createClientValidator("passing", "username"),
          },
          asyncValidators: {
            ...createServerValidator("failing", "email"),
          },
          onSubmitForm: mockOnSubmitForm,
        }
        const form = createForm(formProps)
        const { submit } = form.getSnapshot()

        submit()

        setTimeout(() => {
          res({ result: form.getSnapshot() })
        }, 15)
      })

    const { result } = await promise()

    expect(mockOnSubmitForm).not.toHaveBeenCalledOnce()
    expect(result.validations.email).toStrictEqual({
      checked: true,
      error: new Error("email invalid"),
      validating: false,
    })
  })

  it("calls submit handler if all fields valid - parallel", async () => {
    const initial = {
      email: "",
      username: "",
    }

    const mockOnSubmitForm = vi.fn()

    const formProps = {
      initial,
      validators: {
        ...createClientValidator("passing", "email"),
        ...createClientValidator("passing", "username"),
      },
      asyncValidators: {
        ...createServerValidator("passing", "email"),
      },
      onSubmitForm: mockOnSubmitForm,
      config: {
        validateConcurrentlyOnSubmit: true,
      },
    }

    const promise = () =>
      new Promise<{
        result: FormResult<typeof initial>
      }>((res) => {
        const form = createForm(formProps)
        const { submit } = form.getSnapshot()

        submit()

        setTimeout(() => {
          res({ result: form.getSnapshot() })
        }, 50)
      })

    const { result } = await promise()

    expect(result.validations.email).toStrictEqual({
      checked: true,
      error: undefined,
      validating: false,
    })
    expect(mockOnSubmitForm).toHaveBeenCalledOnce()
    expect(result.isSubmitting).toBeFalsy()
  })

  it("doesn't call submit handler if some validations fail - parallel mode", async () => {
    const initial = {
      email: "",
      username: "",
    }

    const mockOnSubmitForm = vi.fn()

    const promise = () =>
      new Promise<{
        result: FormResult<typeof initial>
      }>((res) => {
        const formProps = {
          initial,
          validators: {
            ...createClientValidator("passing", "email"),
            ...createClientValidator("passing", "username"),
          },
          asyncValidators: {
            ...createServerValidator("failing", "email"),
          },
          onSubmitForm: mockOnSubmitForm,
          config: {
            validateConcurrentlyOnSubmit: true,
          },
        }
        const form = createForm(formProps)
        const { submit } = form.getSnapshot()

        submit()

        setTimeout(() => {
          res({ result: form.getSnapshot() })
        }, 15)
      })

    const { result } = await promise()

    expect(mockOnSubmitForm).not.toHaveBeenCalledOnce()

    expect(result.validations.email).toStrictEqual({
      checked: true,
      error: new Error("email invalid"),
      validating: false,
    })
    expect(result.isSubmitting).toBeFalsy()
  })

  it("isSubmitting is true until Promise returned by onSubmitForm completes", async () => {
    const initial = {}

    const mockOnSubmitForm = vi.fn(() => {
      return Promise.resolve(true).then(delayResult)
    })

    const promise = () =>
      new Promise<{
        result: FormResult<typeof initial>
      }>((res) => {
        const formProps = {
          initial: {},
          onSubmitForm: mockOnSubmitForm,
        }
        const form = createForm(formProps)
        const { submit } = form.getSnapshot()

        submit()

        setTimeout(() => {
          res({ result: form.getSnapshot() })
        }, 15)
      })

    const { result } = await promise()

    expect(mockOnSubmitForm).toHaveBeenCalledOnce()
    expect(result.isSubmitting).toBeTruthy()
  })

  it("modifications - reports modified fields", async () => {
    const staticDefaultValues = {
      email: "",
      username: "",
      project: "",
    }

    const promise = () =>
      new Promise<{
        result: FormResult<typeof staticDefaultValues>
      }>((res) => {
        const formProps = {
          initial: staticDefaultValues,
        }

        const form = createForm(formProps)

        const { update } = form.getSnapshot()

        update("email", "dummy")
        update("username", "dummy")

        setTimeout(() => {
          res({ result: form.getSnapshot() })
        }, 10)
      })

    const { result } = await promise()

    expect(result.modifications.email.isModified).toBeTruthy()
    expect(result.modifications.username.isModified).toBeTruthy()
    expect(result.modifications.project.isModified).toBeFalsy()

    expect(result.isModified).toBeTruthy()
  })

  it("modifications - on submit form is always called with modified only fields compared to the last set initial values", async () => {
    let modificationsInOnSubmitForm = {}

    const mockOnSubmitForm = vi.fn((a, b, modifications) => {
      modificationsInOnSubmitForm = modifications
      return Promise.resolve(true).then(delayResult)
    })

    const initial1 = {
      email: "",
      username: "",
      project: "",
    }

    const initial2 = {
      email: "email",
      username: "username",
      project: "project",
    }

    const promise = () =>
      new Promise<{
        result: FormResult<typeof initial1>
      }>((res) => {
        const formProps = {
          initial: initial1,
          onSubmitForm: mockOnSubmitForm,
        }

        const form = createForm(formProps)

        const { submit, update } = form.getSnapshot()

        // simulate some user updates
        update("email", "email")
        update("username", "loosername")

        // set new initial values
        setTimeout(() => {
          form.setInitial(initial2)
        }, 10)

        setTimeout(() => {
          submit()
        }, 15)

        setTimeout(() => {
          res({ result: form.getSnapshot() })
        }, 30)
      })

    const { result } = await promise()

    expect(result.modifications.email.isModified).toBeFalsy() // email was edited to the new initial value -> no diff
    expect(result.modifications.username.isModified).toBeTruthy() // username was edited to a value different from the new initial -> diff
    expect(result.modifications.project.isModified).toBeFalsy() // project was not edited, but just set to the new initial value

    expect(mockOnSubmitForm).toHaveBeenCalledOnce()
    /// figure out how to expect function arguments directly

    expect(modificationsInOnSubmitForm).toStrictEqual({
      username: "loosername",
    })
  })

  it("modifications - modified fields don't get updated when initial values changes, un-modified fields do get updated", async () => {
    const initial1 = {
      email: "",
      username: "",
      project: "",
    }

    const initial2 = {
      email: "email",
      username: "username",
      project: "project",
    }

    const promise = () =>
      new Promise<{
        result: FormResult<typeof initial1>
      }>((res) => {
        const formProps = {
          initial: initial1,
        }

        const form = createForm(formProps)

        const { submit, update } = form.getSnapshot()

        // simulate some user updates
        update("email", "email")
        update("username", "loosername")

        // set new initial values
        setTimeout(() => {
          form.setInitial(initial2)
        }, 10)

        setTimeout(() => {
          submit()
        }, 15)

        setTimeout(() => {
          res({ result: form.getSnapshot() })
        }, 30)
      })

    const { result } = await promise()

    expect(result.modifications.email.isModified).toBeFalsy() // email was edited to the new initial value -> no diff
    expect(result.modifications.username.isModified).toBeTruthy() // username was edited to a value different from the new initial -> diff
    expect(result.modifications.project.isModified).toBeFalsy() // project was not edited, but just set to the new initial value

    /// modified fields are not touched if the new initial values are set, un-modified ones are set
    expect(result.values).toStrictEqual({
      email: "email",
      username: "loosername",
      project: "project",
    })
  })
})
