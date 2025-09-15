import { neon } from '@netlify/neon';

const sql = neon();

export async function handler(event, context) {
  console.log("👉 Función registro invocada");

  if (event.httpMethod !== "POST") {
    console.log("Método inválido:", event.httpMethod);
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    console.log("📩 Datos recibidos:", data);

    const { nombre, platillo, descripcion, correo } = data;

    // Validación
    const patronInyeccion = /('|--|;|\/\*|\*\/|OR|SELECT|INSERT|DELETE|DROP|UPDATE|<|>)/i;
    if (
      patronInyeccion.test(nombre) ||
      patronInyeccion.test(platillo) ||
      patronInyeccion.test(descripcion) ||
      patronInyeccion.test(correo)
    ) {
      console.log("❌ Entrada inválida detectada");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Entrada inválida" }),
      };
    }

    // Probar conexión antes de insertar
    console.log("🔗 Probando conexión con base de datos...");
    const result = await sql`SELECT NOW()`;
    console.log("✅ Conexión exitosa, hora en DB:", result);

    // Insertar
    await sql`
      INSERT INTO inscripciones (nombre, platillo, descripcion, correo)
      VALUES (${nombre}, ${platillo}, ${descripcion}, ${correo})
    `;

    console.log("✅ Registro insertado correctamente");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Registro guardado correctamente 🎉" }),
    };
  } catch (error) {
    console.error("❌ Error en la función registro:", error);
    return { statusCode: 500, body: "Error interno del servidor" };
  }
}
