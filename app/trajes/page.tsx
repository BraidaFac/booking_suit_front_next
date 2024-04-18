'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
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
  useDisclosure,
} from '@nextui-org/react';
import CookiesUtils from '../../lib/utils/cookies';
import { useUserState } from '@/lib/utils/UserState';
import { API_BACKEND } from '@/lib/utils/constanst';
import { getCookie } from 'cookies-next';
import { Suit } from '@/lib/utils/Suit';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUserState();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [suits, setSuits] = useState<Suit[]>([]);

  async function fetchSuits() {
    const res = await fetch(`${API_BACKEND}/suit`);
    if (res.ok) {
      const suits = await res.json();
      setSuits(
        suits.map((suit: Suit) => {
          return {
            id: suit.id,
            color: suit.color,
            category: suit.category,
            actions: (
              <Button
                size="sm"
                color="primary"
                onClick={async () => {
                  const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                      cors: 'no-cors',
                    },
                  });
                  if (res.ok) {
                    await fetchSuits();
                    toast.success('Traje eliminado');
                  } else if (res.status === 400) {
                    toast.error('El traje tiene reservas activas');
                  } else {
                    toast.error('Error al eliminar el traje');
                  }
                }}
              >
                Eliminar
              </Button>
            ),
          };
        })
      );
    } else {
      router.push('/login');
    }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const suit_id = formData.get('suit_id');
    const suit_color = formData.get('suit_color');
    const suit_category = formData.get('suit_category');
    const suit_brand = formData.get('suit_brand');
    if (!suit_id || !suit_brand || !suit_category || !suit_color) {
      setError(true);
      return;
    }
    const response = await fetch(`${API_BACKEND}/suit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: suit_id,
        color: suit_color,
        category: suit_category,
        brand: suit_brand,
      }),
    });
    console.log(await response.json());

    if (response.ok) {
      setError(false);
      onClose();
      toast.success('Traje creado');
      await fetchSuits();
    } else {
      toast.error('Error al crear traje');
    }
  }
  const fetchUser = async (token: string) => {
    const res = await fetch(`${API_BACKEND}/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      const { username, role } = await res.json();
      setUser({
        name: username,
        role: role,
      });
      if (role === 'LOUNDRY') {
        router.push('/planillas/retirar');
      }
      (async () => {
        await fetchSuits();
        setIsLoading(false);
      })();
    } else {
      setUser(null);
      router.push('/login');
    }
  };
  useEffect(() => {
    const token_cookie = getCookie('Authorization');
    const token = token_cookie ? token_cookie.split(' ')[1] : '';
    if (!token) {
      router.push('/login');
    } else {
      if (!user) {
        (async () => {
          await fetchUser(token);
        })();
      } else {
        if (user.role === 'LOUNDRY') {
          router.push('/planillas/retirar');
        } else {
          (async () => {
            await fetchSuits();
            setIsLoading(false);
          })();
        }
      }
    }
  }, []);

  const columns = [
    { label: 'ID', key: 'id' },
    { label: 'Color', key: 'color' },
    { label: 'Categoria', key: 'category' },
    { label: 'Acciones', key: 'actions' },
  ];
  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        className="w-11/12"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Nuevo traje
              </ModalHeader>
              <ModalBody>
                <form className="" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Codigo"
                      placeholder="Codigo"
                      name="suit_id"
                      type="text"
                    ></Input>
                    <Input
                      label="Color"
                      name="suit_color"
                      type="text"
                      placeholder="Color"
                    />
                    <Select
                      label="Categoria"
                      name="suit_category"
                      placeholder="Categoria"
                    >
                      <SelectItem key="A" value={'A'}>
                        {'A'}
                      </SelectItem>
                      <SelectItem key="B" value={'B'}>
                        {'B'}
                      </SelectItem>
                      <SelectItem key="C" value={'C'}>
                        {'C'}
                      </SelectItem>
                      <SelectItem key="D" value={'D'}>
                        {'D'}
                      </SelectItem>
                      <SelectItem key="E" value={'E'}>
                        {'E'}
                      </SelectItem>
                    </Select>
                    <Input
                      label="Marca"
                      name="suit_brand"
                      type="text"
                      placeholder="Marca"
                    />
                    {error && (
                      <span className="text-red-600">
                        Faltan rellenar campos
                      </span>
                    )}
                    <Button type="submit" color="primary">
                      Guardar
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      {!isLoading ? (
        <div className="w-full p-4 ">
          <div className="flex gap-16 mb-4">
            <Button
              onClick={() => {
                onOpen();
              }}
            >
              Nuevo
            </Button>
            <p className="text-3xl  text-red-700">Trajes</p>
          </div>
          <Table
            aria-label="Example table with custom cells"
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
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={suits}
              isLoading={isLoading}
              emptyContent={isLoading ? null : 'No hay trajes'}
              loadingContent={<Spinner color="danger" />}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center">
          <Spinner color="danger" />
        </div>
      )}
    </>
  );
}
