"use client";
import { API_BACKEND } from "@/lib/utils/constanst";
import { Suit, SuitState } from "@/lib/utils/Suit";
import { useUserState } from "@/lib/utils/UserState";
import {
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Planillas() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUserState();

  const [suitsToLoundry, setSuitToLoundry] = useState<
    {
      suit_id: number;
      suit_color: string;
      actions: JSX.Element;
    }[]
  >([]);

  const fetchSuitToLoundry = async () => {
    const res = await fetch(`${API_BACKEND}/suit/laundry`);

    if (res.status === 200) {
      const suits = await res.json();
      setSuitToLoundry(
        suits.map((suit: Suit) => {
          return {
            suit_id: suit.id,
            suit_color: suit.color,
            actions: (
              <div className="flex flex-row gap-1 justify-center w-1/2 mx-auto">
                <Button
                  size="sm"
                  className="md:max-w-26 md:min-w-26 "
                  color="primary"
                  onClick={async () => {
                    const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        state: SuitState.LAVANDERIALUCECITASUCIO,
                      }),
                    });
                    if (res.ok) {
                      toast.success("Traje entregado correctamente");
                      await fetchSuitToLoundry();
                    } else {
                      toast.error("Error al entregar traje");
                    }
                  }}
                >
                  Lucecita
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  className="md:max-w-26 md:min-w-26"
                  onClick={async () => {
                    const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        state: SuitState.LAVANDERIACELIASUCIO,
                      }),
                    });
                    if (res.ok) {
                      toast.success("Traje entregado correctamente");
                      await fetchSuitToLoundry();
                    } else {
                      toast.error("Error al entregar traje");
                    }
                  }}
                >
                  Celia
                </Button>
              </div>
            ),
          };
        })
      );
    }
  };
  const fetchUser = async (token: string) => {
    const res = await fetch(`${API_BACKEND}/auth/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      const user = await res.json();
      setUser({
        name: user.username,
        role: user.role,
      });
      if (user.role === "LOUNDRY") {
        router.push("/planillas/retirar");
      } else {
        (async () => {
          await fetchSuitToLoundry();
          setIsLoading(false);
        })();
      }
    } else {
      setUser(null);
      router.push("/login");
    }
  };
  useEffect(() => {
    const token_cookie = getCookie("Authorization");
    const token = token_cookie ? token_cookie.split(" ")[1] : "";
    if (!token) {
      router.push("/login");
    } else {
      if (!user) {
        (async () => {
          await fetchUser(token);
        })();
      } else {
        if (user.role === "LAUNDRY") {
          router.push("/planillas/retirar");
        } else {
          (async () => {
            await fetchSuitToLoundry();
            setIsLoading(false);
          })();
        }
      }
    }
  }, []);
  const columns = [
    {
      key: "suit_id",
      label: "Traje",
    },
    {
      key: "suit_color",
      label: "Color",
    },
    { key: "actions", label: "Acciones" },
  ];
  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <Spinner color="danger"></Spinner>
        </div>
      ) : (
        <div>
          <div className="header">
            <p className="text-3xl text-red-800 text-center">
              Llevar Lavanderia
            </p>
          </div>
          <div className="px-2 mx-auto">
            <Table
              aria-label="Example table with dynamic content"
              isHeaderSticky
              bottomContent={
                isLoading ? (
                  <div className="flex w-full justify-center">
                    <Spinner color="danger" />
                  </div>
                ) : null
              }
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn className="text-center" key={column.key}>
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody
                items={suitsToLoundry}
                isLoading={isLoading}
                emptyContent={
                  isLoading ? null : "No hay trajes para llevar a lavanderia"
                }
                loadingContent={<Spinner color="white" />}
              >
                {(item) => (
                  <TableRow key={item.suit_id}>
                    {(columnKey) => (
                      <TableCell className="text-center">
                        {getKeyValue(item, columnKey)}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
