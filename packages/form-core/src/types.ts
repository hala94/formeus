export type FormProps<TForm extends Record<string, unknown>> = {
  initial: TForm;
  validators?: Validators<TForm>;
  asyncValidators?: AsyncValidators<TForm>;
  onSubmitForm?: (form: TForm) => void;
  config?: FormConfig;
};

export type ValidationResult = Error | undefined;

export type Validator<TForm> = (form: TForm) => ValidationResult;

export type Validators<TForm> = Partial<Record<keyof TForm, Validator<TForm>>>;

export type AsyncValidator<TForm> = (
  form: TForm,
  signal: AbortSignal
) => Promise<ValidationResult>;

export type AsyncValidators<TForm> = Partial<
  Record<keyof TForm, AsyncValidator<TForm>>
>;

export type ValidationState = {
  validating: boolean;
  error: ValidationResult;
  checked: boolean;
};

export type ValidationResults<TForm> = Record<keyof TForm, ValidationState>;

export type FormResult<TForm> = {
  values: TForm;
  validations: ValidationResults<TForm>;
  update: <Key extends keyof TForm>(key: Key, value: TForm[Key]) => void;
  runValidation: <Key extends keyof TForm>(key: Key) => void;
  submit: () => void;
  clear: () => void;
  isValid: boolean;
  isValidating: boolean;
};

export type FormConfig = {
  autoValidate: boolean;
};
