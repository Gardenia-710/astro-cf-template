import { parseWithZod } from "@conform-to/zod";
import type { APIRoute } from "astro";
import { schema } from "../../../libs/zod";
import { resend } from "../../../libs/resend";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  //バックエンドバリデーションエラーのハンドリング
  if (submission.status !== "success") {
    return new Response(
      JSON.stringify({
        success: false,
        message:
          "お問い合わせの送信に失敗しました。内容をご確認の上再度お試しください。",
      })
    );
  }

  // Turnstileの検証
  const token = formData.get("cf-turnstile-response");
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: import.meta.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  });
  const outcome = await result.json();
  if (outcome.success) {
    // Turnstileの検証通過
    const email = submission.payload.email as string;
    const fullName = submission.payload.fullName as string;
    const { data, error } = await resend.emails.send({
      from: "Vcan <noreply@vcan-hpv.org>",
      to: [email],
      subject: "【dev】お問い合わせありがとうございます。",
      html: `<strong>It works ${fullName} !</strong>`,
    });
    if (error) {
      console.log(error);
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "お問い合わせの送信に失敗しました。時間をおいて再度お試しください。",
        })
      );
    }
    console.log(data);
    return new Response(
      JSON.stringify({
        success: true,
        message: "お問い合わせを受け付けました。",
      })
    );
  } else {
    // Turnstileの検証エラー
    console.log(outcome);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          "お問い合わせの送信に失敗しました。入力内容をお確かめください。",
      })
    );
  }
};
