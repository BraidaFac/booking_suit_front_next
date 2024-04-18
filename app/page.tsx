'use client';
import Calendar from '@/lib/components/Calendar';
import SideBar from '@/lib/components/SideBar';
import { useSuitContext } from '@/lib/components/SuitContext';
import { useSideBarState } from '@/lib/utils/SideBarState';
import { useUserState } from '@/lib/utils/UserState';
import { Button, Spinner } from '@nextui-org/react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_BACKEND } from '@/lib/utils/constanst';

export default function Home() {
  const { user, setUser } = useUserState();
  const { suit, setSuit } = useSuitContext();
  const { isOpen, setIsOpen } = useSideBarState();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(false);
    } else {
      setUser(null);
      router.push('/login');
    }
  };
  useEffect(() => {
    setSuit(null);
    const token_cookie = getCookie('Authorization');
    const token = token_cookie ? token_cookie.split(' ')[1] : '';
    if (!token) {
      router.push('/login');
      console.log('no token');
    } else {
      if (!user) {
        (async () => {
          await fetchUser(token);
        })();
      } else {
        if (user.role === 'LOUNDRY') {
          router.push('/planillas/retirar');
        } else {
          setIsLoading(false);
        }
      }
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <Spinner color="danger"></Spinner>
        </div>
      ) : (
        <div>
          <Button
            className="btn fixed top-20 left-3 z-50 w-5 p-0 m-0 bg-red-700"
            color="primary"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? 'Ocultar' : 'Trajes'}
          </Button>
          <SideBar isOpen={isOpen} />
          <Calendar />
        </div>
      )}
    </>
  );
}
