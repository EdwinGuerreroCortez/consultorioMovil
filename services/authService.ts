import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://backenddent.onrender.com/api/usuarios";

// Guardar token
export const guardarToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (e) {
    console.error("Error guardando token:", e);
  }
};

// Obtener token
export const obtenerToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (e) {
    console.error("Error obteniendo token:", e);
    return null;
  }
};

// Eliminar token (logout)
export const eliminarToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (e) {
    console.error("Error eliminando token:", e);
  }
};

// Verificar sesión contra backend
export const verificarSesion = async () => {
  try {
    const token = await obtenerToken();
    if (!token) return null;

    const resp = await fetch(`${API_URL}/movil/verificar-sesion`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    return data.usuario;
  } catch (e) {
    console.error("Error verificando sesión:", e);
    return null;
  }
};
