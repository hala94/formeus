export type FormOptions<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
> = {
  initial: TForm
  /**
   * Validator functions mapped to your `initial` object keys.
   * Return `Error` if validation should fail, and `undefined` if the validation should pass.
   *
   * Each validator function gets called with the latest form values.
   */
  validators?: Validators<TForm, TMeta>
  /**
   * Async validator functions mapped to your `initial` object keys.
   *
   * Resolve your validation Promise with  `Error` if validation should fail, and `undefined` if the validation should pass.
   *
   */
  asyncValidators?: AsyncValidators<TForm, TMeta>
  /**
   * Used in conjuction with the returned `submit` method.
   * Called internally if all validations triggered by the `submit` method pass.
   *
   * Scope of this method guarantees validated fields and should be used
   * to "submit" your form values.
   *
   * @param form - validated form values
   * @param meta - up to date meta
   * @param reportSubmission - Function that propagates form values to `connectors`.
   * Can only be called once in the scope of `onSubmitForm` function.
   * If `onSubmitForm` returns a Promise, it is called automatically if Promise resolves without rejecting.
   */
  onSubmitForm?: (
    form: TForm,
    meta: TMeta,
    reportSubmission: () => void
  ) => Promise<unknown> | void
  /**
   * Use meta to propagate additional data to callback functions.
   *
   * React - if provided callback functions close over some surrounding state, pass
   * that state to the meta object to ensure the callback functions get up to date values.
   *
   * Libraries like Solid, Vue, Svelte have reactive primitive getters that resolve the stale-closure
   * problem so meta is most likely not necessary.
   *
   */
  meta?: TMeta
  /**
   * Configure the behaviour of this particular form instance.
   *
   * Setting this config will override values from the global configuration.
   */
  config?: FormConfig
  /**
   * Connectors can be used to collect succesfull form submissions and do additional processing.
   *
   * Provide an `onSubmitForm` function to desired form instance and call the provided `reportSubmission` function to trigger
   * propagating the form values to connectors for additional processing.
   */
  connectors?: Array<FormConnector>
}

export type FormConnector = {
  /**
   *
   * @param values - validated form values at the time of calling `reportSubmission` in supplied `onSubmitForm` function.
   */
  onReportSubmission: (values: Record<string, unknown>) => void
}

export type ValidationResult = Error | undefined

export type Validator<
  TForm,
  TMeta extends Record<string, unknown> = Record<string, unknown>
> = (form: TForm, meta: TMeta) => ValidationResult

export type Validators<
  TForm,
  TMeta extends Record<string, unknown> = Record<string, unknown>
> = Partial<Record<keyof TForm, Validator<TForm, TMeta>>>

export type AsyncValidator<
  TForm,
  TMeta extends Record<string, unknown> = Record<string, unknown>
> = (form: TForm, signal: AbortSignal, meta: TMeta) => Promise<ValidationResult>

export type AsyncValidators<
  TForm,
  TMeta extends Record<string, unknown> = Record<string, unknown>
> = Partial<Record<keyof TForm, AsyncValidator<TForm, TMeta>>>

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
  /**
   * If your `onSubmitForm` function returns a Promise, the value will be `true`
   * until Promise resolves.
   */
  isSubmitting: boolean
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
