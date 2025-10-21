import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button, buttonVariants } from "./ui/button";
import { Menu, LayoutDashboard } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { LogoIcon } from "./Icons";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: "/",
    label: "Главная",
  },
  {
    href: "/generator",
    label: "Генератор пресс-релизов",
  },
  {
    href: "/improve-text",
    label: "Улучшение текста",
  },
  {
    href: "/distribution",
    label: "Рассылка",
  },
  {
    href: "/media-management",
    label: "База СМИ",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <a
              rel="noreferrer noopener"
              href="/"
              className="ml-2 font-bold text-xl flex"
            >
              <LogoIcon />
              PressReach
            </a>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden items-center gap-2">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <ModeToggle />

            <Sheet
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>

              <SheetContent side={"left"}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">
                    PressReach
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  <SignedIn>
                    <a
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: "default" })}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Личный кабинет
                    </a>
                  </SignedIn>

                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      {label}
                    </a>
                  ))}

                  <SignedOut>
                    <div className="flex flex-col gap-2 mt-4 w-full">
                      <Button asChild variant="ghost" className="w-full">
                        <a href="/sign-in">Войти</a>
                      </Button>
                      <Button asChild className="w-full">
                        <a href="/sign-up">Начать</a>
                      </Button>
                    </div>
                  </SignedOut>
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* desktop */}
          <nav className="hidden md:flex gap-2">
            {routeList.map((route: RouteProps, i) => (
              <a
                rel="noreferrer noopener"
                href={route.href}
                key={i}
                className={`text-[17px] ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {route.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex gap-2 items-center">
            <ModeToggle />

            {/* Показываем разные элементы для авторизованных и неавторизованных пользователей */}
            <SignedOut>
              <Button asChild variant="ghost">
                <a href="/sign-in">Войти</a>
              </Button>
              <Button asChild>
                <a href="/sign-up">Начать</a>
              </Button>
            </SignedOut>

            <SignedIn>
              <Button asChild variant="outline" size="sm">
                <a href="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Кабинет
                </a>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
