
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(Request: Request) {
    const order: {nombre: string;
        fecha: string | Date;
        telefono: string;
        items: string[]; // Array of product details
        direccion: string;
        barrio: string;
        total: number;
        ciudadDepartamento: string;}  = await Request.json();
  
  try {
    // Verificar que tenemos la API key
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY no está configurada');
      return Response.json({ error: 'API key de Resend no configurada' }, { status: 500 });
    }

    console.log('Enviando email con datos:', {
      nombre: order.nombre,
      telefono: order.telefono,
      direccion: order.direccion,
      barrio: order.barrio,
      total: order.total,
      ciudadDepartamento: order.ciudadDepartamento,
      items: order.items
    });

    // Crear el HTML del email manualmente
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
          <tr>
            <td style="padding: 20px;">
              <h1 style="color: #1F2937; font-size: 24px; margin: 0;">¡Nueva Orden Recibida!</h1>
              <p style="color: #6B7280; font-size: 14px; margin: 5px 0 0;">Detalles del pedido del cliente.</p>
            </td>
          </tr>
        </table>
        
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px;">
              <h2 style="color: #1F2937; font-size: 18px; margin: 0 0 15px;">👤 Información del Cliente</h2>
              <p><strong>Nombre:</strong> ${order.nombre}</p>
              <p><strong>📞 WhatsApp:</strong> ${order.telefono}</p>
              <p><strong>📅 Fecha del pedido:</strong> ${order.fecha instanceof Date ? order.fecha.toISOString() : order.fecha}</p>
            </td>
          </tr>
        </table>
        
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px;">
              <h2 style="color: #1F2937; font-size: 18px; margin: 0 0 15px;">📦 Productos Solicitados</h2>
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px;">
                ${order.items.map(item => `<p style="margin: 5px 0;">${item}</p>`).join('')}
              </div>
            </td>
          </tr>
        </table>
        
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 20px;">
              <h2 style="color: #1F2937; font-size: 18px; margin: 0 0 15px;">📍 Dirección de Entrega</h2>
              <p><strong>Dirección:</strong> ${order.direccion}</p>
              ${order.barrio ? `<p><strong>🏘️ Barrio:</strong> ${order.barrio}</p>` : ''}
              <p><strong>Ciudad y Departamento:</strong> ${order.ciudadDepartamento}</p>
            </td>
          </tr>
        </table>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #10B981; color: white;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">💰 Total del Pedido: ${order.total.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
              })}</h2>
            </td>
          </tr>
        </table>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'orders@chgroup.store',
      to: ['group.ch.2025@gmail.com'],
      subject: `Nueva orden de ${order.nombre}`,
      html: emailHTML,
    });

    if (error) {
      console.error('Error de Resend:', error);
      return Response.json({ error: error.message || 'Error al enviar email' }, { status: 500 });
    }

    console.log('Email enviado exitosamente:', data);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Error general al enviar email:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Error desconocido al enviar email' 
    }, { status: 500 });
  }
}