import { useEffect, useState } from "react";
import { verificarSesion, eliminarToken } from "@/services/authService";

export const useAuth = () => {
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await verificarSesion();
      setUsuario(user);
      setCargando(false);
    };
    checkAuth();
  }, []);

  const logout = async () => {
    await eliminarToken();
    setUsuario(null);
  };

  return { usuario, cargando, logout };
};
