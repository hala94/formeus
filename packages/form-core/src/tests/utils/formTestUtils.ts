import { ClientValidators, ServerValidators } from "../../types";
import { delayResult } from "./misc";

type MockResultOption =
  | "failing"
  | "passing"
  | "throws"
  | "resolves_with_unsupported_type";

const validationDelay = <T>(value: T) => delayResult<T>(value, 10);

export function createClientValidator<TForm>(
  option: MockResultOption,
  key: keyof TForm
): ClientValidators<TForm> {
  const validators = {} as unknown as ClientValidators<TForm>;

  switch (option) {
    case "passing":
      return Object.assign(validators, {
        [key]: () => undefined,
      });
    case "failing":
      return Object.assign(validators, {
        [key]: () => new Error(`${key as string} invalid`),
      });
    case "throws":
      return Object.assign(validators, {
        [key]: () => {
          throw new Error(`${key as string} throw`);
        },
      });
    case "resolves_with_unsupported_type":
      return Object.assign(validators, {
        [key]: () => 5,
      });
  }
}

export function createServerValidator<TForm>(
  option: MockResultOption,
  key: keyof TForm
): ServerValidators<TForm> {
  const validators = {} as unknown as ServerValidators<TForm>;

  switch (option) {
    case "passing":
      return Object.assign(validators, {
        [key]: () => Promise.resolve(undefined).then(validationDelay),
      });
    case "failing":
      return Object.assign(validators, {
        [key]: () =>
          Promise.resolve(new Error(`${key as string} invalid`)).then(
            validationDelay
          ),
      });
    case "throws":
      return Object.assign(validators, {
        [key]: () =>
          Promise.resolve(undefined)
            .then(validationDelay)
            .then(() => {
              throw new Error(`${key as string} throw`);
            }),
      });
    case "resolves_with_unsupported_type":
      return Object.assign(validators, {
        [key]: () => Promise.resolve(5).then(validationDelay),
      });
  }
}
