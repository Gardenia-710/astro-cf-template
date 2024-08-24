import { z } from "zod";

export const schema = z.object({
  fullName: z.string({ required_error: "お名前の入力は必須です。" }),
  email: z
    .string({ required_error: "メールアドレスは必須です。" })
    .email("メールアドレスの形式で入力してください。"),
});
