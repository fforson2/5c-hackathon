import { ApiError } from "./api";

export interface FormErrors {
  fields: Record<string, string>;
  form?: string;
}

/** Maps an API error to per-field messages plus a form-level message. */
export function toFormErrors(err: unknown, fieldNames: readonly string[]): FormErrors {
  if (!(err instanceof ApiError)) return { fields: {}, form: "Something went wrong. Please try again." };

  if (err.status === 409 || err.code === "ALREADY_REGISTERED") {
    return { fields: {}, form: "This email is already registered. You're all set — see you there!" };
  }
  if (err.status === 429 || err.code === "RATE_LIMITED") {
    return { fields: {}, form: "Too many attempts. Please wait a minute and try again." };
  }
  if (err.status === 400) {
    const fields: Record<string, string> = {};
    const leftovers: string[] = [];
    for (const [key, message] of Object.entries(err.details)) {
      const root = key.split(/[.[]/)[0];
      if (fieldNames.includes(root)) fields[root] = fields[root] ?? message;
      else leftovers.push(message);
    }
    return {
      fields,
      form: Object.keys(fields).length ? "Please fix the highlighted fields." : leftovers[0] ?? err.message,
    };
  }
  return { fields: {}, form: err.message || "Something went wrong. Please try again." };
}
