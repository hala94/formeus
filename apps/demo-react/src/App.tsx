import { useForm, ClientValidators, ServerValidators } from "@dh/react-form";
import { useState } from "react";
import { Button, Input, InputProps } from "ui";

type Form = {
  email: string;
  password: string;
  username: string;
  project: string;
};

const initial: Form = {
  email: "",
  password: "",
  username: "",
  project: "",
};

const clientValidators: ClientValidators<Form> = {
  email: ({ email }) =>
    email.length == 0 ? new Error("Email validation failed.") : undefined,
  password: ({ password }) =>
    password.length < 5 ? new Error("Enter at least 5 chars.") : undefined,
  username: ({ username }) =>
    username.length == 0 ? new Error("Username validation failed.") : undefined,
};

const serverValidators: ServerValidators<Form> = {
  email: ({ email }) => {
    return Promise.resolve(undefined).then(delayResult);
  },
  username: ({ email }) => {
    return Promise.resolve(undefined).then(delayResult);
  },
};

export default function App() {
  const [submitting, setSubmitting] = useState(false);

  const { form, validations, update, isValid, submit, isValidating } = useForm({
    initial,
    onSubmitForm,
    clientValidators,
    serverValidators,
    config: { autoValidate: true },
  });

  function onSubmitForm(form: Form) {
    setSubmitting(true);
    Promise.resolve(false)
      .then(delayResult)
      .then(setSubmitting)
      .then(() => {
        console.log("Form sent");
      });
  }

  function generateInputProps(): Array<InputProps> {
    return Object.keys(initial).map((key) => {
      const formKey = key as keyof Form;
      return {
        label: key,
        value: form[formKey],
        validating: validations[formKey].validating,
        checked: validations[formKey].checked,
        error: validations[formKey].result?.message,
        disabled: submitting,
        onChange: (e) => update(formKey, e.target.value),
      };
    });
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>React DEMO</p>
        <div className="p-8 flex flex-col gap-3 min-w-[25rem]">
          {...generateInputProps().map((inputProps) => (
            <Input {...inputProps} />
          ))}
          <Button
            disabled={submitting || !isValid}
            onClick={() => submit()}
            className="mt-12"
          />
        </div>
        <div className="max-w-[30rem]">
          {JSON.stringify(validations, null, 2)}
        </div>
      </div>
    </>
  );
}

function delayResult<T>(value: T, delay: number = 3000) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}
