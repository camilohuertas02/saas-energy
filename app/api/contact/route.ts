import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, company, locations } = body;

    // Validación básica de los datos entrantes
    if (!name || !email || !company || !locations) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: 'Plataforma Vectia <notificaciones@vectia.com.co>',
      to: ['ventas@vectia.com.co'],
      replyTo: email, // Permite que le respondas al cliente desde Zoho dándole a "Responder"
      subject: `🔥 Nuevo Lead B2B: ${company} - ${locations} sedes`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Nueva solicitud de demostración de Vectia</h2>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p><strong>Nombre del prospecto:</strong> ${name}</p>
            <p><strong>Correo corporativo:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Empresa:</strong> ${company}</p>
            <p><strong>Tamaño de la operación:</strong> ${locations} sedes</p>
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #64748b;">
            Este mensaje fue generado automáticamente desde la landing page. Para contactar al prospecto, simplemente responde a este correo.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error enviando correo con Resend:', error);
    return NextResponse.json(
      { error: 'Hubo un problema al enviar el correo' },
      { status: 500 }
    );
  }
}
