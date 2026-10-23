'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Hexagon, Home, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  // Vista para usuarios NO logueados (Visitantes)
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50 h-10 px-6 font-medium">
          <Link href="/sign-in">Ingresar</Link>
        </Button>
        <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 font-medium shadow-sm">
          <Link href="/contact/">Agendar una demo</Link>
        </Button>
      </div>
    );
  }

  // Vista para usuarios SI logueados (Dashboard activo)
  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="cursor-pointer size-10 border border-gray-200 hover:ring-2 hover:ring-blue-100 transition-all shadow-sm">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1 w-48 p-2 mt-2 rounded-xl shadow-lg border-gray-100">
        <DropdownMenuItem className="cursor-pointer focus:bg-blue-50 focus:text-blue-700 rounded-md transition-colors" asChild>
          <Link href="/dashboard" className="flex w-full items-center py-1">
            <Home className="mr-2 h-4 w-4 text-gray-500" />
            <span className="font-medium">Panel de control</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full mt-1 border-t border-gray-100 pt-1">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer focus:bg-red-50 focus:text-red-600 rounded-md text-gray-600 transition-colors">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-medium">Cerrar sesión</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
        
        {/* LOGO (Izquierda) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center bg-blue-600 rounded-lg p-1.5 group-hover:bg-blue-700 transition-colors shadow-sm">
            <Hexagon className="h-5 w-5 text-white fill-current" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Vectia</span>
        </Link>

        {/* NAVEGACIÓN (Centro - Oculto en móviles muy pequeños) */}
        <nav className="hidden md:flex items-center space-x-8">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 focus:outline-none transition-colors cursor-pointer data-[state=open]:text-blue-600">
              Productos <ChevronDown className="h-4 w-4 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 mt-4 p-2 rounded-xl shadow-lg border-gray-100">
              <DropdownMenuItem className="cursor-pointer focus:bg-blue-50 focus:text-blue-700 rounded-md transition-colors" asChild>
                <Link href="#" className="font-medium text-gray-700 w-full">Vectia IA</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Nuestros clientes
          </Link>
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Sobre nosotros
          </Link>
        </nav>

        {/* ACCIONES Y MENÚ DE USUARIO (Derecha) */}
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-10 w-24 bg-gray-100 rounded-full animate-pulse" />}>
            <UserMenu />
          </Suspense>
        </div>

      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}
