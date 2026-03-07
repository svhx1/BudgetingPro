import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
    try {
        const { error } = await resend.emails.send({
            from: "Budgeting <onboarding@resend.dev>",
            to: email,
            subject: `${code} — Código de verificação Budgeting`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:linear-gradient(135deg,rgba(20,20,25,0.95),rgba(15,15,20,0.98));border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:48px 40px;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="width:56px;height:56px;background:linear-gradient(135deg,#10b981,#6366f1);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="font-size:28px;">💰</span>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Código de Verificação</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;">
                Use o código abaixo para acessar o <strong style="color:rgba(255,255,255,0.7);">Budgeting</strong>. Ele expira em 10 minutos.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:16px;padding:20px 32px;display:inline-block;">
                <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#10b981;font-family:'SF Mono',Monaco,monospace;">${code}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.5;">
                Se você não solicitou este código, ignore este email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error: "Falha ao enviar email" };
        }

        return { success: true };
    } catch (e) {
        console.error("Email send error:", e);
        return { success: false, error: "Erro ao enviar email" };
    }
}
