"use client";
import { useUserState } from "@/lib/utils/UserState";
import { API_BACKEND } from "@/lib/utils/constanst";
import { Button, Input } from "@nextui-org/react";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import CookiesUtils from "../../lib/utils/cookies";
export default function Login() {
  const { user, setUser } = useUserState();
  const router = useRouter();
  const [error, setError] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userName = formData.get("username");
    const password = formData.get("password");

    const response = await fetch(`${API_BACKEND}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });

    if (response.ok) {
      setError(false);
      const { access_token, user } = await response.json();
      const token = `Bearer ${access_token}`;
      CookiesUtils.setItem("Authorization", token);
      setUser({
        name: user.name,
        role: user.role,
      });
      if (user.role === "LAUNDRY") {
        router.push("planillas/retirar");
      } else {
        router.push("/");
      }
    } else {
      setError(true);
    }
  }
  useEffect(() => {
    const token_cookie = CookiesUtils.getItem("Authorization");
    if (!token_cookie) {
      setUser(null);
    } else {
      const token = token_cookie.split(" ")[1];
      (async () => {
        const res = await fetch(`${API_BACKEND}/auth/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (res.ok) {
          const { username, role } = await res.json();
          setUser({
            name: username,
            role: role,
          });
          if (role === "LOUNDRY") {
            router.push("/planillas/retirar");
          } else {
            router.push("/");
          }
        } else {
          setUser(null);
          deleteCookie("Authorization");
        }
      })();
    }
  }, []);
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col w-3/4 mx-auto gap-2 mt-10">
          <label className="text-white text-xl">Usuario</label>
          <Input
            type="text"
            placeholder="Username"
            name="username"
            required
            autoComplete="off"
          />
          <label className="text-white text-xl">Password</label>
          <Input
            type="password"
            placeholder="Password"
            name="password"
            required
            autoComplete="off"
          />
          {error && (
            <span className="text-red-600">Credenciales invalidas</span>
          )}
          <Button type="submit" className="mt-4">
            Ingresar
          </Button>
        </div>
      </form>
    </div>
  );
}
