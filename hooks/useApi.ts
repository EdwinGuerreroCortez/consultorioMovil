import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://backenddent.onrender.com";

export function useApi() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/get-csrf-token`, {
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
        await AsyncStorage.setItem("csrfToken", data.csrfToken);
      } catch (err) {
        console.error("Error al obtener CSRF:", err);
      }
    };
    getToken();
  }, []);

  const fetchWithCsrf = async (path: string, options: any = {}) => {
    const token =
      csrfToken || (await AsyncStorage.getItem("csrfToken"));

    const finalOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": token || "",
      },
      credentials: "include",
    };

    const res = await fetch(`${BASE_URL}${path}`, finalOptions);

    let data: any;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  };

  return { fetchWithCsrf, csrfToken };
}
