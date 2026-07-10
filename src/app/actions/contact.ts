"use server";

import nodemailer from "nodemailer";
import { headers } from "next/headers";

// Simple in-memory rate limiting (since we don't have Redis).
// This is not perfectly accurate in serverless environments, but it provides basic protection.
const rateLimit = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3;

export async function submitContactForm(formData: FormData) {
  try {
    // 1. Basic Rate Limiting
    const ip = headers().get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const userLimit = rateLimit.get(ip);
    
    if (userLimit && now - userLimit.timestamp < RATE_LIMIT_WINDOW) {
      if (userLimit.count >= MAX_REQUESTS) {
        return { success: false, error: "Muitas requisições. Tente novamente em alguns minutos." };
      }
      userLimit.count += 1;
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }

    // 2. Honeypot check
    const honeypot = formData.get("address_field");
    if (honeypot) {
      // Bot detected
      return { success: true }; // Fake success
    }

    // 3. Extraction & Validation
    const type = formData.get("type") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;
    const consent = formData.get("consent");

    if (!name || (!phone && !email) || !consent) {
      return { success: false, error: "Preencha todos os campos obrigatórios e aceite os termos." };
    }

    // 4. Build Email Content
    let subject = "Novo Contato pelo Site";
    let htmlContent = `<h2>Novo Contato</h2><p><strong>Nome:</strong> ${name}</p>`;

    if (phone) htmlContent += `<p><strong>Telefone:</strong> ${phone}</p>`;
    if (email) htmlContent += `<p><strong>E-mail:</strong> ${email}</p>`;

    if (type === "scheduling") {
      const propertyTitle = formData.get("propertyTitle");
      const propertyUrl = formData.get("propertyUrl");
      subject = `[Agendamento] Interesse em: ${propertyTitle}`;
      htmlContent += `<p><strong>Interesse:</strong> <a href="${propertyUrl}">${propertyTitle}</a></p>`;
    } else if (type === "sell_land") {
      subject = "[Captação] Interesse em vender terreno";
      htmlContent += `<p><strong>Interesse:</strong> Venda de Terreno</p>`;
    } else if (type === "contact") {
      subject = "[Contato] Mensagem pelo site";
      if (message) htmlContent += `<p><strong>Mensagem:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`;
    }

    htmlContent += `<hr/><p><small>Este e-mail foi gerado automaticamente pelo site da Mitram Imóveis.</small></p>`;

    // 5. Send Email via SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Site Mitram" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECIPIENT,
      subject,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Erro interno ao enviar a mensagem." };
  }
}
