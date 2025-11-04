/**
 * @jest-environment node
 */

const axios = require("axios");

const API_BASE_URL = process.env.API_BASE_URL || "https://backenddent.onrender.com";
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

jest.setTimeout(30000);

if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
    throw new Error(
        "Faltan TEST_USER_EMAIL o TEST_USER_PASSWORD en las variables de entorno"
    );
}

describe("API móvil - login y historial de citas (Render)", () => {
    let token;
    let usuarioId;

    test("Login móvil devuelve token y usuario", async () => {
        const resp = await axios.post(
            `${API_BASE_URL}/api/usuarios/login-movil`,
            {
                email: TEST_USER_EMAIL,
                password: TEST_USER_PASSWORD,
            },
            {
                validateStatus: () => true, // para que no truene axios con 4xx/5xx
            }
        );

        console.log("Status login:", resp.status, resp.data);

        expect(resp.status).toBe(200);
        expect(resp.data).toHaveProperty("token");
        expect(resp.data).toHaveProperty("usuario");
        expect(resp.data.usuario).toHaveProperty("id");

        token = resp.data.token;
        usuarioId = resp.data.usuario.id;

        console.log("✅ Usuario autenticado:", usuarioId);
    });

    test("Historial de citas devuelve arreglo de citas o vacío", async () => {
        expect(usuarioId).toBeDefined();

        const resp = await axios.get(
            `${API_BASE_URL}/api/citas/historial/${usuarioId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`, // por si tu endpoint valida JWT
                },
                validateStatus: () => true,
            }
        );

        console.log("Status historial:", resp.status);
        console.log("Citas:", resp.data);

        expect(resp.status).toBe(200);
        expect(Array.isArray(resp.data)).toBe(true);

        if (resp.data.length > 0) {
            const cita = resp.data[0];
            expect(cita).toHaveProperty("cita_id");
            expect(cita).toHaveProperty("fecha_hora");
            expect(cita).toHaveProperty("estado_cita");
            expect(cita).toHaveProperty("estado_pago");
            expect(cita).toHaveProperty("tratamiento");
            expect(cita).toHaveProperty("estado_tratamiento");
        }
    });
});
