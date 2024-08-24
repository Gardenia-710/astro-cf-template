import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { schema } from "../libs/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";

type TurnstileStatus = "error" | "expired" | "solved";

type Props = {
  siteKey: string;
};
export default function ContactForm({ siteKey }: Props) {
  const [status, setStatus] = useState<TurnstileStatus>();
  const [form, fields] = useForm({
    constraint: getZodConstraint(schema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit(event, { formData }) {
      // フォームの送信を停止
      event.preventDefault();

      fetch("/api/contact", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.success) {
            return alert(
              "メッセージの送信に失敗しました。時間をおいて再度お試しください。"
            );
          }
          return location.assign("/contact/thanks");
        })
        .catch((error) =>
          alert(
            "メッセージの送信に失敗しました。時間をおいて再度お試しください。"
          )
        );
    },
  });

  return (
    <form method="post" action="/api/contact" {...getFormProps(form)}>
      <div id={form.errorId}>{form.errors}</div>
      <div>
        <label htmlFor={fields.email.id}>メールアドレス</label>
        <input {...getInputProps(fields.email, { type: "email" })} />
        <div id={fields.email.errorId}>{fields.email.errors}</div>
      </div>
      <div>
        <label htmlFor={fields.fullName.id}>お名前</label>
        <input {...getInputProps(fields.fullName, { type: "text" })} />
        <div id={fields.fullName.errorId}>{fields.fullName.errors}</div>
      </div>
      <Turnstile
        siteKey={siteKey}
        onError={() => setStatus("error")}
        onExpire={() => setStatus("expired")}
        onSuccess={() => setStatus("solved")}
      />
      <button disabled={status == "solved" ? undefined : true}>Send</button>
    </form>
  );
}
