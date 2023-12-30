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
   * Comparator closures that allow you to compare latest and initial value for each of the form fields.
   *
   * Returning `true` from an individual field comparator will result in the field being marked as "modified".
   * Each field will be automatically value compared with the strict equality operator to determine if its modified, so
   * if your form contains only strings or numbers for example, there is no need to provide this property.
   *
   * Use it for form fields whose values are objects.
   *
   */
  comparators?: Comparators<TForm>
  /**
   * Used in conjuction with the returned `submit` method.
   * Called internally if all validations triggered by the `submit` method pass.
   *
   * Scope of this method guarantees validated fields and should be used
   * to "submit" your form values securely.
   *
   * `modifiedFields` - will contain only modified fields, more precisely the fields whose value is not the same as their initial (default) value
   */
  onSubmitForm?: OnSubmitForm<TForm, TMeta>
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
}

export type OnSubmitForm<TForm, TMeta> = (
  form: TForm,
  meta: TMeta,
  modifiedFields: Partial<TForm>
) => Promise<unknown> | void

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

export type Comparator<TForm> = (
  newValue: TForm[keyof TForm],
  oldValue: TForm[keyof TForm]
) => boolean

export type Comparators<TForm> = Partial<Record<keyof TForm, Comparator<TForm>>>

export type ValidationState = {
  validating: boolean
  error: ValidationResult
  checked: boolean
}

export type ValidationResults<TForm> = Record<keyof TForm, ValidationState>

export type ModificationResults<TForm> = Record<
  keyof TForm,
  { isModified: boolean }
>

export type FormResult<TForm> = {
  values: TForm
  validations: ValidationResults<TForm>
  modifications: ModificationResults<TForm>
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
  /**
   * `true` if any of the form field current value is different than its initial value.
   */
  isModified: boolean
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
  /**
   * `true` - If form field had a validation error, updating that field will preserve the validation error.
   *
   * `false` - Form field validation error is cleared when that field is updated.
   *
   * This doesn't affect validation logic and result in any way, it controls the preserving of error state between updates.
   *
   * Default is `false`.
   */
  preserveValidationErrorOnUpdate?: boolean
}
