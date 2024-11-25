"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
  select,
  useDisclosure,
} from "@nextui-org/react";
import { Suit, SuitState } from "@/lib/utils/Suit";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { useSuits } from "./hooks/useSuits";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../login/hooks/useAuth";
import { clear } from "console";

export default function SuitsPage() {
  const { fetchSuits, deleteSuit, createSuit, updateSuit } = useSuits();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);

  const { user, isLoading: isAuthLoading } = useAuth();
  // Hook para obtener la lista de trajes
  const {
    data: suits,
    error,
    mutate,
    isLoading,
  } = useSWR<Suit[]>("suits", fetchSuits);

  // Esquema de validación para el formulario de trajes
  const schema = yup.object().shape({
    id: yup.string().required("El código es obligatorio"),
    color: yup.string().required("El color es obligatorio"),
    category: yup.string().required("La categoría es obligatoria"),
    brand: yup.string().required("La marca es obligatoria"),
    state: yup.string(),
    size: yup
      .number()
      .typeError("El talle es obligatorio")
      .min(38, "Desde talle 38")
      .max(70, "Hasta talle 70")
      .required("El talle es obligatorio"),
  });

  // Hook para manejar el formulario de trajes
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Lógica para manejar la creación de un traje
  const onSubmit = async (data: any) => {
    const success = isEditing ? await updateSuit(data) : await createSuit(data);
    if (success) {
      onClose();
      setIsEditing(false);
      setSelectedSuit(null);
      mutate(); // Revalida la lista de trajes tras la creación
    }
  };

  // Lógica para eliminar un traje
  const handleDelete = async (suitId: string) => {
    const success = await deleteSuit(suitId);
    if (success) {
      mutate(); // Revalida la lista de trajes tras la eliminación
    }
  };

  //Logica para actualizar
  const handleEdit = (suit: Suit) => {
    setSelectedSuit(suit);
    setIsEditing(true);
    onOpen();
  };
  // Resetear el formulario cuando se cierra el modal
  const handleClose = () => {
    reset(); // Limpia el formulario
    setIsEditing(false); // Restablecer el estado de edición
    setSelectedSuit(null); // Restablecer el traje seleccionado
    onClose(); // Cerrar el modal
  };

  // Configuración de columnas para la tabla de trajes
  const columns = [
    { label: "Codigo", key: "id" },
    { label: "Color", key: "color" },
    { label: "Categoria", key: "category" },
    { label: "Marca", key: "brand" },
    { label: "Talle", key: "size" },
    { label: "Estado", key: "state" },
    { label: "Acciones", key: "actions" },
  ];

  useEffect(() => {
    if (selectedSuit) {
      reset(selectedSuit);
    }
  }, [selectedSuit, reset]);
  if (isLoading || isAuthLoading) {
    return <Spinner className="absolute right-1/2 top-1/2" color="danger" />;
  }
  if (error) {
    return (
      <div className="absolute right-1/2 top-1/2">
        Error al cargar los trajes
      </div>
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        className="w-11/12"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? "Modificar traje" : "Nuevo traje"}
              </ModalHeader>
              <ModalBody>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Input
                    {...register("id")}
                    label="Codigo"
                    placeholder="Codigo"
                  />
                  <Input
                    {...register("color")}
                    label="Color"
                    startContent={true}
                    placeholder="Color"
                  />
                  {errors.color && (
                    <span className="text-red-600 text-xs">
                      {errors.color.message}
                    </span>
                  )}
                  <Input
                    {...register("brand")}
                    label="Marca"
                    placeholder="Marca"
                  />
                  {errors.brand && (
                    <span className="text-red-600 text-xs">
                      {errors.brand.message}
                    </span>
                  )}
                  <Input
                    {...register("size", { valueAsNumber: true })}
                    label="Talle"
                    placeholder="Talle"
                    type="number"
                  />
                  {errors.size && (
                    <span className="text-red-600 text-xs">
                      {errors.size.message}
                    </span>
                  )}

                  <Select {...register("category")} label="Categoría">
                    <SelectItem key="A" value="A">
                      A
                    </SelectItem>
                    <SelectItem key="B" value="B">
                      B
                    </SelectItem>
                    <SelectItem key="C" value="C">
                      C
                    </SelectItem>
                  </Select>
                  {errors.category && (
                    <span className="text-red-600 text-xs">
                      {errors.category.message}
                    </span>
                  )}
                  {/* {isEditing && (
                    <>
                      <Select {...register("state")} label="Estado del traje">
                        <SelectItem
                          key={SuitState.ENLOCALLIMPIO}
                          value={SuitState.ENLOCALLIMPIO}
                        >
                          EN LOCAL LIMPIO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.ENLOCALSUCIO}
                          value={SuitState.ENLOCALSUCIO}
                        >
                          EN LOCAL SUCIO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.RETIRADO}
                          value={SuitState.RETIRADO}
                        >
                          RETIRADO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.LAVANDERIALIMPIO}
                          value={SuitState.LAVANDERIALIMPIO}
                        >
                          EN LAVANDERIA LIMPIO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.LAVANDERIASUCIO}
                          value={SuitState.LAVANDERIASUCIO}
                        >
                          EN LAVANDERIA SUCIO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.MODISTA}
                          value={SuitState.MODISTA}
                        >
                          MODISTA
                        </SelectItem>
                      </Select>
                      {errors.category && (
                        <span className="text-red-600 text-xs">
                          {errors.state?.message}
                        </span>
                      )}
                    </>
                  )} */}
                  <Button className="mt-4" type="submit" color="primary">
                    Guardar
                  </Button>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Tabla de trajes */}

      <div className="w-11/12 mx-auto">
        <Button onClick={onOpen} color="success" className="mb-2">
          Nuevo
        </Button>
        <Table aria-label="Tabla de trajes">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn className="text-red-500" key={column.key}>
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={suits || []}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.size}</TableCell>
                <TableCell>{item.state}</TableCell>
                <TableCell>
                  <div className="flex flex-row gap-3">
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() => {
                        handleEdit(item);
                      }}
                    >
                      Modificar
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onClick={async () => await handleDelete(item.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
