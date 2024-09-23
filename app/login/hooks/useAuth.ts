// hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { API_BACKEND } from "@/lib/utils/constanst";
import { useUserState } from "@/lib/utils/UserState";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUserState(); // Usar un estado global o un hook para manejar el usuario
  const router = useRouter();

  // Función para verificar el token de usuario
  const fetchUser = useCallback(
    async (token: string) => {
      const res = await fetch(`${API_BACKEND}/auth/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const { username, role } = await res.json();
        setUser({ name: username, role });
        setIsLoading(false);
      } else {
        setUser(null);
        router.push("/login");
      }
    },
    [router, setUser]
  );

  // Verificar el token en las cookies
  useEffect(() => {
    const token_cookie = getCookie("Authorization");
    const token = token_cookie ? token_cookie.split(" ")[1] : "";

    if (!token) {
      router.push("/login"); // Redirige si no hay token
    } else if (!user) {
      fetchUser(token); // Verifica el token si el usuario aún no está cargado
    } else {
      setIsLoading(false); // Deja de mostrar el loader si el usuario ya está cargado
    }
  }, [user, fetchUser, router]);

  return { user, isLoading };
};
