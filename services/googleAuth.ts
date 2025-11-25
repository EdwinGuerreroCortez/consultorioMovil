// src/services/googleAuth.ts
import * as AuthSession from "expo-auth-session";

const clientId =
    "1031243738046-kud901kc7d15ilcnqopvrm0mfq7fkv3r.apps.googleusercontent.com";

export async function iniciarSesionConGoogle(): Promise<string | null> {
    try {
        // URL a donde Google regresará después de iniciar sesión
        const redirectUri = AuthSession.makeRedirectUri({
            scheme: "consultoriomovil", // el mismo que tienes en app.json
        });

        const authUrl =
            "https://accounts.google.com/o/oauth2/v2/auth?" +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            "&response_type=token" +
            "&scope=profile%20email";

        const result = await AuthSession.startAsync({ authUrl });

        if (result.type === "success" && result.params.access_token) {
            return result.params.access_token as string;
        }

        return null;
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
        return null;
    }
}

// Obtener info del usuario con el access_token
export async function obtenerDatosUsuarioGoogle(
    accessToken: string
): Promise<any> {
    const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!resp.ok) {
        throw new Error("No se pudo obtener la información del usuario de Google");
    }

    return await resp.json();
}
