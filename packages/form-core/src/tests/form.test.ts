import { createForm } from "../form";
import { describe, expect, it, SpyInstance, vi, afterEach } from "vitest";
import {
  createClientValidator,
  createServerValidator,
} from "./utils/formTestUtils";
import { FormResult } from "../types";

describe.concurrent("form", () => {
  it("correctly updates results", () => {
    const form = createForm({ initial: { email: "", username: "" } });
    const { update } = form.getSnapshot();

    update("email", "test@test.com");
    update("username", "123");

    const snapshot = form.getSnapshot();
    expect(snapshot.form.email).toBe("test@test.com");
    expect(snapshot.form.username).toBe("123");
  });

  it("has correct state after running client validations", async () => {
    const initial = {
      email: "",
      username: "",
      password: "",
      note: "",
    };
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res, rej) => {
        const form = createForm({
          initial,
          clientValidators: {
            ...createClientValidator("passing", "email"),
            ...createClientValidator("failing", "username"),
            ...createClientValidator("throws", "password"),
            ...createClientValidator("resolves_with_unsupported_type", "note"),
          },
        });
        const { runValidation } = form.getSnapshot();

        runValidation("email");
        runValidation("username");
        runValidation("password");
        runValidation("note");

        setTimeout(() => {
          res(form.getSnapshot());
        }, 0);
      });

    const result = await promise();

    expect(result.validations.email).toStrictEqual({
      checked: true,
      result: undefined,
      validating: false,
    });

    expect(result.validations.username).toStrictEqual({
      checked: true,
      result: new Error("username invalid"),
      validating: false,
    });

    expect(result.validations.password).toStrictEqual({
      checked: true,
      result: new Error("password throw"),
      validating: false,
    });

    expect(result.validations.note).toStrictEqual({
      checked: true,
      result: undefined,
      validating: false,
    });
  });

  it("has correct state after running server validations", async () => {
    const initial = {
      email: "",
      username: "",
      password: "",
      note: "",
    };
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res, rej) => {
        const form = createForm({
          initial,
          serverValidators: {
            ...createServerValidator("passing", "email"),
            ...createServerValidator("failing", "username"),
            ...createServerValidator("throws", "password"),
            ...createServerValidator("resolves_with_unsupported_type", "note"),
          },
        });
        const { runValidation } = form.getSnapshot();

        runValidation("email");
        runValidation("username");
        runValidation("password");
        runValidation("note");

        setTimeout(() => {
          res(form.getSnapshot());
        }, 15);
      });

    const result = await promise();

    expect(result.validations.email).toStrictEqual({
      checked: true,
      result: undefined,
      validating: false,
    });

    expect(result.validations.username).toStrictEqual({
      checked: true,
      result: new Error("username invalid"),
      validating: false,
    });

    expect(result.validations.password).toStrictEqual({
      checked: true,
      result: new Error("password throw"),
      validating: false,
    });

    expect(result.validations.note).toStrictEqual({
      checked: true,
      result: undefined,
      validating: false,
    });
  });

  it("has correct state after running both client and server validations", async () => {
    const initial = {
      email: "",
      username: "",
      password: "",
      note: "",
    };
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res, rej) => {
        const form = createForm({
          initial,
          clientValidators: {
            ...createClientValidator("passing", "email"),
            ...createClientValidator("failing", "username"),
            ...createClientValidator("throws", "password"),
            ...createClientValidator("resolves_with_unsupported_type", "note"),
          },
          serverValidators: {
            ...createServerValidator("passing", "email"),
            ...createServerValidator("failing", "username"),
            ...createServerValidator("throws", "password"),
            ...createServerValidator("resolves_with_unsupported_type", "note"),
          },
        });
        const { runValidation } = form.getSnapshot();

        runValidation("email");
        runValidation("username");
        runValidation("password");
        runValidation("note");

        setTimeout(() => {
          res(form.getSnapshot());
        }, 20);
      });

    const result = await promise();

    expect(result.validations.email).toStrictEqual({
      checked: true,
      result: undefined,
      validating: false,
    });

    expect(result.validations.username).toStrictEqual({
      checked: true,
      result: new Error("username invalid"),
      validating: false,
    });

    expect(result.validations.password).toStrictEqual({
      checked: true,
      result: new Error("password throw"),
      validating: false,
    });

    expect(result.validations.note).toStrictEqual({
      checked: true,
      result: undefined,
      validating: false,
    });
  });

  it("failing client validator stops server validator from running", async () => {
    const initial = {
      email: "",
      username: "",
    };
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res, rej) => {
        const form = createForm({
          initial,
          clientValidators: {
            ...createClientValidator("failing", "email"),
          },
          serverValidators: {
            ...createServerValidator("passing", "email"),
          },
        });
        const { runValidation } = form.getSnapshot();

        runValidation("email");

        setTimeout(() => {
          res(form.getSnapshot());
        }, 15);
      });

    const { validations } = await promise();

    expect(validations.email).toStrictEqual({
      checked: true,
      result: new Error("email invalid"),
      validating: false,
    });
  });

  it("has correct state indicating validation in progress", async () => {
    const initial = {
      email: "",
      username: "",
    };
    const promise = () =>
      new Promise<FormResult<typeof initial>>((res, rej) => {
        const form = createForm({
          initial,
          serverValidators: {
            ...createServerValidator("passing", "email"),
          },
        });
        const { runValidation } = form.getSnapshot();

        runValidation("email");

        setTimeout(() => {
          res(form.getSnapshot());
        }, 5);
      });

    const { validations, isValid } = await promise();

    expect(validations.email).toStrictEqual({
      checked: false,
      result: undefined,
      validating: true,
    });
    expect(isValid).toBeFalsy();
  });

  it("calls submit handler if all fields valid", async () => {
    const initial = {
      email: "",
      username: "",
    };

    const formProps = {
      initial,
      clientValidators: {
        ...createClientValidator("passing", "email"),
        ...createClientValidator("passing", "username"),
      },
      serverValidators: {
        ...createServerValidator("passing", "email"),
      },
      onSubmitForm: () => {},
    };

    const submitSpy = vi.spyOn(formProps, "onSubmitForm");

    const promise = () =>
      new Promise<{
        result: FormResult<typeof initial>;
      }>((res, rej) => {
        const form = createForm(formProps);
        const { submit } = form.getSnapshot();

        submit();

        setTimeout(() => {
          res({ result: form.getSnapshot() });
        }, 50);
      });

    const { result } = await promise();

    expect(submitSpy).toHaveBeenCalledOnce();
    expect(result.validations.email).toStrictEqual({
      checked: true,
      result: undefined,
      validating: false,
    });
  });

  it("doesn't call submit handler if some validations fail", async () => {
    const initial = {
      email: "",
      username: "",
    };

    const promise = () =>
      new Promise<{
        result: FormResult<typeof initial>;
        submitSpy: SpyInstance<[], void>;
      }>((res, rej) => {
        const formProps = {
          initial,
          clientValidators: {
            ...createClientValidator("passing", "email"),
            ...createClientValidator("passing", "username"),
          },
          serverValidators: {
            ...createServerValidator("failing", "email"),
          },
          onSubmitForm: () => {},
        };
        const form = createForm(formProps);
        const { submit } = form.getSnapshot();

        const submitSpy = vi.spyOn(formProps, "onSubmitForm");

        submit();

        setTimeout(() => {
          res({ result: form.getSnapshot(), submitSpy });
        }, 50);
      });

    const { result, submitSpy } = await promise();

    expect(submitSpy).not.toHaveBeenCalledOnce();
    expect(result.validations.email).toStrictEqual({
      checked: true,
      result: new Error("email invalid"),
      validating: false,
    });
  });
});
