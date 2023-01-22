import { ChangeEventHandler, useState } from "react";
import { useForm, ClientValidators, ServerValidators } from "@dh/react-form";

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

export default function Demo() {
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
        <div className="p-8 flex flex-col gap-3 min-w-[25rem]">
          {...generateInputProps().map((inputProps) => (
            <Input {...inputProps} />
          ))}
          <Button2
            disabled={submitting || !isValid}
            onClick={() => submit()}
            className="mt-12"
          />
        </div>
      </div>
    </>
  );
}

type InputProps = {
  label: string;
  value: string;
  error?: string;
  validating?: boolean;
  checked?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
};

function Input({
  onChange,
  label,
  error,
  checked,
  validating,
  disabled,
}: InputProps) {
  return (
    <div className="flex flex-col w-[25rem] relative">
      <label className="min-h-[1.5rem] text-xs text-slate-600">{label}</label>
      <input
        disabled={disabled}
        className="border rounded-md h-12 px-4"
        onChange={onChange}
      />
      <label className="min-h-[1.5rem] text-xs text-red-600 mt-1">
        {error}
      </label>
      {checked && <CheckedSvg />}
      <ValidatingSpinner spinning={validating} />
    </div>
  );
}

type ButtonProps = {
  className?: string;
  onClick: () => void;
  disabled?: boolean;
};

function Button2({ className, onClick, disabled }: ButtonProps) {
  const activeClass = disabled ? "bg-blue-200 " : "bg-blue-600 ";

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`h-12 px-4 rounded-md text-sm text-white font-medium ${activeClass} ${
        className ?? ""
      }`}
    >
      Submit
    </button>
  );
}

function ValidatingSpinner({ spinning }: { spinning: boolean }) {
  const spinStyle = spinning ? "" : "hidden";
  return (
    <svg
      aria-hidden="true"
      className={`mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 absolute top-0 bottom-0 -right-8 m-auto ${spinStyle}`}
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="white"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
  );
}

function CheckedSvg() {
  return (
    <svg
      className="w-6 h-6 stroke-green-500 stroke-2 absolute top-0 bottom-0 -right-6 m-auto"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
    >
      <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>
  );
}

function delayResult<T>(value: T, delay: number = 3000) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}
