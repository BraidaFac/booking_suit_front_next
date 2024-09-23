import { API_BACKEND } from "@/lib/utils/constanst";
import { Suit } from "@/lib/utils/Suit";
import { toast } from "react-hot-toast";

export const useSuits = () => {
  const fetchSuits = async () => {
    const res = await fetch(`${API_BACKEND}/suit`);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error("Error fetching suits");
    }
  };

  const updateSuit = async (suit: Suit) => {
    const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suit),
    });

    if (res.ok) {
      toast.success("Traje actualizado");
      return true;
    } else {
      toast.error("Error al actualizar el traje");
      return false;
    }
  };

  const deleteSuit = async (suitId: number) => {
    const res = await fetch(`${API_BACKEND}/suit/${suitId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        cors: "no-cors",
      },
    });

    if (res.ok) {
      toast.success("Traje eliminado");
      return true;
    } else if (res.status === 400) {
      toast.error("El traje tiene reservas activas");
    } else {
      toast.error("Error al eliminar el traje");
    }
    return false;
  };

  // Crear un traje nuevo
  const createSuit = async (suit: Suit) => {
    const res = await fetch(`${API_BACKEND}/suit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suit),
    });
    if (res.ok) {
      console.log(res);

      toast.success("Traje creado");
      return true;
    } else {
      toast.error("Error al crear el traje");
      return false;
    }
  };
  return { fetchSuits, deleteSuit, createSuit, updateSuit };
};
