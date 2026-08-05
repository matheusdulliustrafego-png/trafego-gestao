import { Resend } from "resend";
import { formatDayNumber, formatMonthLabel, formatWeekday } from "@/lib/format";

const FROM = "Tráfego Real <onboarding@resend.dev>";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY não configurado.");
  return new Resend(apiKey);
}

export async function enviarLembreteReuniao({
  paraEmail,
  paraNome,
  titulo,
  data,
  observacoes,
}: {
  paraEmail: string;
  paraNome: string;
  titulo: string;
  data: Date;
  observacoes?: string;
}) {
  const resend = getResend();

  const dataFormatada = `${formatWeekday(data)}, ${formatDayNumber(data)} de ${formatMonthLabel(data)}`;

  await resend.emails.send({
    from: FROM,
    to: paraEmail,
    subject: `Lembrete: ${titulo} amanhã`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0d0d0d; color: #ffffff; border-radius: 16px;">
        <p style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #c0c0c0; margin: 0 0 16px;">Tráfego Real</p>
        <h1 style="font-size: 20px; margin: 0 0 12px;">Olá, ${paraNome}!</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #e4e4e4; margin: 0 0 16px;">
          Este é um lembrete de que você tem uma reunião marcada para <strong>amanhã</strong>:
        </p>
        <div style="background: #1a1a1a; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0 0 4px; font-weight: bold; font-size: 16px;">${titulo}</p>
          <p style="margin: 0; color: #9a9a9a; font-size: 14px;">${dataFormatada}</p>
          ${observacoes ? `<p style="margin: 12px 0 0; color: #c0c0c0; font-size: 14px;">${observacoes}</p>` : ""}
        </div>
        <p style="font-size: 13px; color: #9a9a9a; margin: 0;">Qualquer dúvida, é só responder este e-mail.</p>
      </div>
    `,
  });
}
