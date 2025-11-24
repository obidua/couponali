"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tag, Store, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  {
    title: "Home",
    href: ROUTES.home,
    icon: Home,
  },
  {
    title: "Coupons",
    href: ROUTES.coupons,
    icon: Tag,
  },
  {
    title: "Stores",
    href: ROUTES.merchants,
    icon: Store,
  },
  {
    title: "Gift Cards",
    href: ROUTES.products,
    icon: Gift,
  },
  {
    title: "Account",
    href: ROUTES.profile,
    icon: User,
    authRequired: true,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          // If auth required and not authenticated, change to login
          const href =
            item.authRequired && !isAuthenticated ? ROUTES.login : item.href;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.authRequired && !isAuthenticated ? "Login" : item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
