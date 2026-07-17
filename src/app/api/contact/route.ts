import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().or(z.literal("")),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    // TODO: 串接 Email 服務（如 Nodemailer、SendGrid、Resend 等）
    // 目前先記錄到 console，未來可擴充為寄送 Email 或存入資料庫
    console.log("收到諮詢表單：", data);

    return NextResponse.json({ success: true, message: "諮詢已送出" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "表單資料格式錯誤", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "伺服器錯誤" },
      { status: 500 }
    );
  }
}
