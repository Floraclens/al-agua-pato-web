import type { Metadata } from "next"
import { PaginaLegal, SeccionLegal } from "@/components/pagina-legal"
import { LEYENDA_AAIP, TITULAR, WHATSAPP_VISIBLE } from "@/lib/datos-titular"

export const metadata: Metadata = {
  title: "Política de privacidad | Al Agua Pato",
  description: "Qué datos pedimos al reservar, para qué los usamos y cómo ejercer tus derechos (Ley 25.326).",
  alternates: { canonical: "/privacidad" },
}

// Ley 25.326 art. 6 (informar antes de recolectar) + Res. AAIP 14/2018 art. 3 (leyenda literal).
// MODELO: no se publica hasta que la titular lo apruebe.
export default function PaginaPrivacidad() {
  return (
    <PaginaLegal titulo="Política de privacidad" bajada="Cómo tratamos los datos que dejás al reservar (Ley 25.326).">
      <SeccionLegal titulo="Quién es responsable de tus datos">
        <p>
          {TITULAR.nombre}, CUIT {TITULAR.cuit}, con domicilio en {TITULAR.domicilio}. Contacto: {TITULAR.email} o WhatsApp {WHATSAPP_VISIBLE}.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Qué datos pedimos">
        <p>
          <strong>Reserva de cumpleaños:</strong> nombre y apellido, teléfono, email, nombre y edad del cumpleañero/a, y
          los datos de la reserva (fecha, turno, extras y método de pago).
        </p>
        <p>
          <strong>Reserva de egresaditos:</strong> nombre y apellido, teléfono, email, institución, sala o curso y turno
          escolar, y los datos de la reserva.
        </p>
        <p>
          Los datos del cumpleañero/a o del grupo escolar los carga la persona adulta que hace la reserva.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Para qué los usamos">
        <p>
          Solo para gestionar tu reserva: confirmarla, coordinar la seña y el evento, y contactarte por WhatsApp. No los
          usamos para publicidad ni los vendemos o cedemos a terceros.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Dónde se guardan y quién más interviene">
        <p>
          Se guardan en la base de datos de reservas de Al Agua Pato. Para que la web funcione usamos proveedores que
          los procesan por nuestra cuenta: Supabase (base de datos, con servidores en San Pablo, Brasil) y Vercel
          (alojamiento de la web; empresa de Estados Unidos con servidores en varios países). Cuando nos escribís por WhatsApp, el mensaje pasa por ese servicio.
        </p>
        <p>
          La web usa Vercel Analytics para contar visitas en forma agregada, sin identificarte.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="¿Es obligatorio darlos?">
        <p>
          Brindarlos es voluntario, pero sin nombre, teléfono y email no podemos tomar la reserva. Los demás datos son
          opcionales.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Tus derechos">
        <p>
          Podés pedir acceso a tus datos, corregirlos o que los borremos, sin costo, escribiendo a {TITULAR.email} o al
          WhatsApp {WHATSAPP_VISIBLE}. Te respondemos dentro de los plazos de la Ley 25.326.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Órgano de control">
        <p className="font-semibold">{LEYENDA_AAIP}</p>
      </SeccionLegal>
    </PaginaLegal>
  )
}
