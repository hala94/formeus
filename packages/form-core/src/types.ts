export type FormOptions<TForm extends Record<string, unknown>> = {
  initial: TForm
  /**
   * Validator functions mapped to your `initial` object keys.
   * Return `Error` if validation should fail, and `undefined` if the validation should pass.
   *
   * Each validator function gets called with the latest form values.
   */
  validators?: Validators<TForm>
  /**
   * Async validator functions mapped to your `initial` object keys.
   *
   * Resolve your validation Promise with  `Error` if validation should fail, and `undefined` if the validation should pass.
   *
   */
  asyncValidators?: AsyncValidators<TForm>
  /**
   * Used in conjuction with the returned `submit` method.
   * Called internally if all validations triggered by the `submit` method pass.
   *
   * Scope of this method guarantees validated fields and should be used
   * to "submit" your form values.
   */
  onSubmitForm?: (form: TForm) => void
  config?: FormConfig
}

export type ValidationResult = Error | undefined

export type Validator<TForm> = (form: TForm) => ValidationResult

export type Validators<TForm> = Partial<Record<keyof TForm, Validator<TForm>>>

export type AsyncValidator<TForm> = (
  form: TForm,
  signal: AbortSignal
) => Promise<ValidationResult>

export type AsyncValidators<TForm> = Partial<
  Record<keyof TForm, AsyncValidator<TForm>>
>

export type ValidationState = {
  validating: boolean
  error: ValidationResult
  checked: boolean
}

export type ValidationResults<TForm> = Record<keyof TForm, ValidationState>

export type FormResult<TForm> = {
  values: TForm
  validations: ValidationResults<TForm>
  update: <Key extends keyof TForm>(key: Key, value: TForm[Key]) => void
  runValidation: <Key extends keyof TForm>(key: Key) => void
  /**
   * Starts validating unchecked fields, and calls `onSubmitForm` if all validations passed.
   *
   * Control the validation behaviour with the `validateConcurrentlyOnSubmit` flag in the configuration object.
   */
  submit: () => void
  /**
   * Reset form to the `initial` values.
   */
  clear: () => void
  /**
   * `true` if all fields are checked and passed validation.
   */
  isValid: boolean
  /**
   * `true` if any field is currently being validated.
   */
  isValidating: boolean
}

/**
 * @param autoValidate -
 *
 * @param validateConcurrentlyOnSubmit -
 */
export type FormConfig = {
  /**
   * If `true`, form will run validator functions on every update.
   *
   * Default is `false`.
   */
  autoValidate?: boolean
  /**
   * `true` - calling `submit()` will start validation for all form fields concurrently.
   *
   * `false` - calling `submit()` starts validating your form fields in order, stopping if any validation fails.
   *
   * Default is `false`.
   */
  validateConcurrentlyOnSubmit?: boolean
}
