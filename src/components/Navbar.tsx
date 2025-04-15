"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, ShieldUser, User } from "lucide-react";
import Link from "next/link";

import { clearCartCookie } from "@/app/auth/actions";
import { mergeCartOnLogin } from "@/app/productos/actions";
import { authClient } from "@/lib/client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import CartSheet from "./CartSheet";
import MobileMenu from "./MobileMenu";
import SearchDialog from "./SearchDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const signIn = async () => {
  const userLog = await authClient.signIn.social({
    provider: "google",
  });
};

const signOut = async () => {
  await authClient.signOut();

  // Clear the cartId cookie
  await clearCartCookie();
};

const hideNavbarRoutes = [
  "/admin/",
  "/admin/nuevo",
  "/admin/productos",
  "/admin/atributos",
  "/admin/categorias",
  "/order/nuevo",
  "/order/success",
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const mergeCart = async () => {
      if (session?.user?.id) {
        try {
          const merged = await mergeCartOnLogin(session.user.id);
          if (merged.success) {
            console.log("Carrito de invitado fusionado con el de usuario");
          } else {
            console.error(
              "Error al fusionar el carrito de invitado con el de usuario"
            );
          }
        } catch (error) {
          console.error("Error al intentar fusionar el carrito:", error);
        }
      }
    };

    mergeCart();
  }, [session?.user?.id]);

  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }

  return (
    <header className="px-5 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MobileMenu />

        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">ICHI</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link
            href="/productos"
            className="transition-colors hover:text-primary"
          >
            Productos
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {session?.user.role === "admin" && (
            <Link
              href="/admin"
              className="hidden md:flex gap-2 hover:underline"
            >
              <ShieldUser /> Admin
            </Link>
          )}
          <SearchDialog />

          {!session?.user.id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Cuenta de usuario</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button
                    onClick={signIn}
                    className="px-4 py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150"
                  >
                    <img
                      className="w-6 h-6"
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      loading="lazy"
                      alt="google logo"
                    />
                    <span>Inicia con Google</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src={session.user.image ?? ""} />
                  <AvatarFallback>
                    {session.user.name.split("")[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150"
                  >
                    <LogOut className="size-5" />
                    <span>Cerrar sesion</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <CartSheet />
        </div>
      </div>
    </header>
  );
}
