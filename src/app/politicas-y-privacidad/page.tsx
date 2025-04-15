import Link from "next/link";

export const metadata = {
  title: "Políticas de Privacidad | ICHI Calzado",
  description:
    "Políticas de privacidad para clientes de ICHI Calzado en Colombia",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 md:px-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">
        Políticas de Privacidad
      </h1>

      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-8">
          Última actualización:{" "}
          {new Date().toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">1. Introducción</h2>
          <p>
            ICHI Calzado (en adelante, "ICHI", "nosotros", "nuestro") se
            compromete a proteger la privacidad de los datos personales que
            recopilamos de nuestros clientes y usuarios del sitio web. Esta
            Política de Privacidad explica cómo recopilamos, utilizamos,
            divulgamos y protegemos su información cuando utiliza nuestro sitio
            web y servicios, especialmente en relación con nuestros servicios de
            venta de calzado en Colombia, incluyendo nuestras opciones de pago
            contraentrega y envío gratuito.
          </p>
          <p>
            Al utilizar nuestro sitio web y servicios, usted acepta las
            prácticas descritas en esta Política de Privacidad. Esta política
            cumple con la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013
            de Colombia, que regulan la protección de datos personales.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            2. Información que Recopilamos
          </h2>
          <p>Podemos recopilar los siguientes tipos de información:</p>

          <h3 className="text-xl font-medium mt-6 mb-3">
            2.1 Información Personal
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Nombre completo</li>
            <li>Dirección de entrega y facturación</li>
            <li>Número de teléfono</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de identificación (cédula o NIT)</li>
            <li>Información de pago (para transacciones en línea)</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3">
            2.2 Información de Uso
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Dirección IP</li>
            <li>Tipo de navegador y dispositivo</li>
            <li>Páginas visitadas y tiempo de permanencia</li>
            <li>Productos vistos o añadidos al carrito</li>
            <li>Historial de compras</li>
            <li>Cookies y tecnologías similares</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            3. Cómo Utilizamos su Información
          </h2>
          <p>Utilizamos la información recopilada para:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Procesar y entregar sus pedidos de calzado</li>
            <li>Gestionar el pago contraentrega</li>
            <li>Coordinar el envío gratuito a su dirección</li>
            <li>Comunicarnos con usted sobre su pedido</li>
            <li>Proporcionar servicio al cliente y soporte técnico</li>
            <li>
              Enviar información sobre promociones, nuevos productos o cambios
              en nuestros servicios (si ha dado su consentimiento)
            </li>
            <li>Mejorar nuestro sitio web y la experiencia de compra</li>
            <li>Prevenir fraudes y actividades ilegales</li>
            <li>Cumplir con obligaciones legales y fiscales</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            4. Compartir su Información
          </h2>
          <p>Podemos compartir su información personal con:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Empresas de logística y transporte para entregar sus pedidos
            </li>
            <li>
              Proveedores de servicios de pago para procesar transacciones
            </li>
            <li>Proveedores de servicios de marketing y análisis de datos</li>
            <li>Autoridades gubernamentales cuando sea requerido por ley</li>
          </ul>
          <p>
            No vendemos, alquilamos ni intercambiamos su información personal
            con terceros para fines de marketing sin su consentimiento
            explícito.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            5. Seguridad de la Información
          </h2>
          <p>
            Implementamos medidas de seguridad técnicas, administrativas y
            físicas diseñadas para proteger su información personal contra
            acceso no autorizado, pérdida, alteración o destrucción. Estas
            medidas incluyen:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encriptación de datos sensibles</li>
            <li>Acceso restringido a la información personal</li>
            <li>Monitoreo regular de nuestros sistemas</li>
            <li>Capacitación de personal en prácticas de seguridad</li>
          </ul>
          <p>
            Sin embargo, ningún método de transmisión por Internet o
            almacenamiento electrónico es 100% seguro, por lo que no podemos
            garantizar su seguridad absoluta.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            6. Cookies y Tecnologías Similares
          </h2>
          <p>
            Utilizamos cookies y tecnologías similares para mejorar su
            experiencia en nuestro sitio web, recordar sus preferencias y
            analizar cómo se utiliza nuestro sitio. Puede configurar su
            navegador para rechazar todas las cookies o para indicar cuándo se
            está enviando una cookie. Sin embargo, algunas funciones de nuestro
            sitio pueden no funcionar correctamente sin cookies.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">7. Sus Derechos</h2>
          <p>
            De acuerdo con la ley colombiana de protección de datos, usted tiene
            derecho a:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Conocer, actualizar y rectificar sus datos personales</li>
            <li>
              Solicitar prueba de la autorización otorgada para el tratamiento
              de sus datos
            </li>
            <li>
              Ser informado sobre el uso que se ha dado a sus datos personales
            </li>
            <li>
              Revocar la autorización y/o solicitar la supresión de sus datos
              cuando considere que no se han respetado sus derechos
            </li>
            <li>
              Acceder gratuitamente a sus datos personales que hayan sido objeto
              de tratamiento
            </li>
            <li>
              Presentar quejas ante la Superintendencia de Industria y Comercio
              por infracciones a la ley
            </li>
          </ul>
          <p>
            Para ejercer estos derechos, por favor contáctenos utilizando la
            información proporcionada en la sección "Contacto" de esta política.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">8. Retención de Datos</h2>
          <p>
            Conservaremos su información personal durante el tiempo necesario
            para cumplir con los fines descritos en esta Política de Privacidad,
            a menos que la ley exija o permita un período de retención más
            largo. Los criterios utilizados para determinar nuestros períodos de
            retención incluyen:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>El tiempo que mantenemos una relación activa con usted</li>
            <li>Si existe una obligación legal a la que estamos sujetos</li>
            <li>
              Si la retención es aconsejable a la luz de nuestra posición legal
              (como en relación con la prescripción de acciones legales)
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">9. Menores de Edad</h2>
          <p>
            Nuestros servicios no están dirigidos a menores de 18 años. No
            recopilamos a sabiendas información personal de menores de 18 años.
            Si descubrimos que hemos recopilado información personal de un menor
            de 18 años, tomaremos medidas para eliminar dicha información de
            nuestros registros lo antes posible.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            10. Cambios a esta Política
          </h2>
          <p>
            Podemos actualizar esta Política de Privacidad periódicamente para
            reflejar cambios en nuestras prácticas de información o por otros
            motivos operativos, legales o regulatorios. Le notificaremos
            cualquier cambio material publicando la nueva Política de Privacidad
            en esta página y, cuando sea apropiado, le notificaremos por correo
            electrónico o mediante un aviso destacado en nuestro sitio web.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            11. Información Específica sobre Pago Contraentrega y Envío Gratuito
          </h2>
          <p>
            Para facilitar nuestros servicios de pago contraentrega y envío
            gratuito en toda Colombia, recopilamos y procesamos información
            adicional como:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Dirección detallada de entrega (incluyendo referencias para
              facilitar la ubicación)
            </li>
            <li>Horarios de disponibilidad para recibir el pedido</li>
            <li>Preferencias de contacto para la coordinación de la entrega</li>
          </ul>
          <p>
            Esta información se comparte con nuestros socios logísticos
            exclusivamente para el propósito de entregar su pedido y gestionar
            el pago contraentrega.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">12. Contacto</h2>
          <p>
            Si tiene preguntas, comentarios o solicitudes relacionadas con esta
            Política de Privacidad o el tratamiento de sus datos personales, por
            favor contáctenos a:
          </p>
          <div className="mt-4">
            <p>
              <strong>ICHI Calzado</strong>
            </p>
            <p>Dirección: [Dirección Física de la Empresa]</p>
            <p>Correo electrónico: privacidad@ichicalzado.com</p>
            <p>Teléfono: [Número de Teléfono]</p>
          </div>
        </section>

        <div className="border-t pt-8 mt-10">
          <p className="text-sm text-muted-foreground">
            Al utilizar nuestro sitio web y servicios, usted reconoce que ha
            leído y entendido esta Política de Privacidad y acepta estar sujeto
            a ella.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
