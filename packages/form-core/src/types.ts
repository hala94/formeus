export type FormProps<TForm extends Record<string, unknown>> = {
  initial: TForm;
  clientValidators?: ClientValidators<TForm>;
  serverValidators?: ServerValidators<TForm>;
  onSubmitForm?: (form: TForm) => void;
  config?: FormConfig;
};

export type ValidationResult = Error | undefined;

export type ClientValidator<TForm> = (form: TForm) => ValidationResult;

export type ClientValidators<TForm> = Partial<
  Record<keyof TForm, ClientValidator<TForm>>
>;

export type ServerValidator<TForm> = (
  form: TForm,
  signal: AbortSignal
) => Promise<ValidationResult>;
export type ServerValidators<TForm> = Partial<
  Record<keyof TForm, ServerValidator<TForm>>
>;

export type ValidationState = {
  validating: boolean;
  result: ValidationResult;
  checked: boolean;
};

export type ValidationResults<TForm> = Record<keyof TForm, ValidationState>;

export type FormResult<TForm> = {
  form: TForm;
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
