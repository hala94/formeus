import { getFormConfig } from "./formConfig";
import { createParallelQueue } from "./parallelTaskQueue";
import { createSerialQueue } from "./serialTaskQueue";
import { createSubscribable } from "./subscribable";
import {
  FormProps,
  FormResult,
  ValidationResults,
  ValidationState,
  ClientValidators,
  ServerValidators,
} from "./types";
import { createValidationTask } from "./validationTask";

export function createForm<TForm extends Record<string, unknown>>({
  config = getFormConfig(),
  ...props
}: FormProps<TForm>) {
  const subscribable = createSubscribable<FormResult<TForm>>();
  const parallelTaskQueue = createParallelQueue();
  const serialTaskQueue = createSerialQueue();

  let currentForm = props.initial;
  let validations = createInitialValidations(
    props.initial,
    props.clientValidators,
    props.serverValidators
  );
  let result: FormResult<TForm> = {
    form: currentForm,
    validations,
    update,
    runValidation,
    submit,
    isValid: isFormValid(validations),
    isValidating: isFormValidating(validations),
  };

  function update<Key extends keyof TForm>(key: Key, value: TForm[Key]) {
    Object.assign(currentForm, { [key]: value });

    serialTaskQueue.cancelAllTasks();

    invalidateValidation(
      key,
      props.clientValidators,
      props.serverValidators,
      validations
    );

    pushResult();

    config?.autoValidate && runValidation(key);
  }

  function runValidation<Key extends keyof TForm>(key: Key) {
    parallelTaskQueue.cancelTask(key as string);

    const clientFN = props.clientValidators && props.clientValidators[key];
    const serverFN = props.serverValidators && props.serverValidators[key];

    if (!clientFN && !serverFN) return;

    const task = createValidationTask({
      key: key as keyof TForm,
      form: currentForm,
      clientValidatorFN: clientFN,
      serverValidatorFN: serverFN,
      onValidationUpdate: (validationResult) => {
        Object.assign(validations, { [key]: validationResult });
        pushResult();
      },
      existingResult: validations[key],
    });

    parallelTaskQueue.addTask(task);
  }

  function submit() {
    serialTaskQueue.cancelAllTasks();
    parallelTaskQueue.cancelAllTasks();

    const validationTasks = createValidationTasks(
      currentForm,
      props.clientValidators,
      props.serverValidators,
      validations,
      pushResult
    );

    serialTaskQueue.addTasks(validationTasks, ({ success }) => {
      success && props.onSubmitForm?.(currentForm);
    });
  }

  function pushResult() {
    result = {
      ...result,
      form: currentForm,
      validations,
      isValid: isFormValid(validations),
      isValidating: isFormValidating(validations),
    };
    subscribable.publish(result);
  }

  return {
    ...subscribable,
    getSnapshot: () => result,
  };
}

function isFormValid<TForm>(validations: ValidationResults<TForm>) {
  return Object.values(validations).every((v) => {
    const validation = v as ValidationState;
    return validation.checked && Boolean(validation.result) == false;
  });
}

function isFormValidating<TForm>(validations: ValidationResults<TForm>) {
  return Object.values(validations).some((v) => {
    const validation = v as ValidationState;
    return validation.validating == true;
  });
}

function createValidationTasks<TForm extends Record<string, unknown>>(
  currentForm: TForm,
  clientValidators: ClientValidators<TForm> | undefined,
  serverValidators: ServerValidators<TForm> | undefined,
  validations: ValidationResults<TForm>,
  pushResult: () => void
) {
  return Object.keys(validations)
    .map((key) => {
      const clientFN = clientValidators && clientValidators[key];
      const serverFN = serverValidators && serverValidators[key];

      if (!clientFN && !serverFN) return;

      return createValidationTask({
        key: key,
        form: currentForm,
        clientValidatorFN: clientFN,
        serverValidatorFN: serverFN,
        onValidationUpdate: (validationResult) => {
          Object.assign(validations, { [key]: validationResult });
          pushResult();
        },
        existingResult: validations[key],
      });
    })
    .filter((t) => !!t !== false) as Array<
    ReturnType<typeof createValidationTask>
  >;
}

function invalidateValidation<TForm extends Record<string, unknown>>(
  key: keyof TForm,
  clientValidators: ClientValidators<TForm> | undefined,
  serverValidators: ServerValidators<TForm> | undefined,
  validations: ValidationResults<TForm>
) {
  const clientFN = clientValidators && clientValidators[key];
  const serverFN = serverValidators && serverValidators[key];

  if (clientFN || serverFN) {
    Object.assign(validations, {
      [key]: {
        result: undefined,
        checked: false,
        validating: false,
      } as ValidationState,
    });
  }
}

function createInitialValidations<TForm extends Record<string, unknown>>(
  initialForm: TForm,
  clientValidators: ClientValidators<TForm> | undefined,
  serverValidators: ServerValidators<TForm> | undefined
) {
  let validations = {} as ValidationResults<TForm>;

  // if (!clientValidators && !serverValidators) return validations;

  for (const [key, _] of Object.entries(initialForm)) {
    const clientFN = clientValidators && clientValidators[key];
    const serverFN = serverValidators && serverValidators[key];

    const validation = {
      checked: !clientFN && !serverFN,
      result: undefined,
      validating: false,
    } as ValidationState;

    validations = { ...validations, [key]: validation };
  }
  return validations;
}
