import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User } from "lucide-react";

const fetchMe = async () => {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

export default function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  const links = [
    { href: "/invoices", label: "Invoices" },
    { href: "/create-invoice", label: "Create Invoice" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Menu className="w-5 h-5 text-green-600" />
          <span className="text-lg font-semibold text-gray-900">
            Invoicer Pro
          </span>
        </div>
        <nav className="flex items-center gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-3 py-2 rounded-md ${
                router.pathname === link.href
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {me ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-green-600" />
                <span>{me.email}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-green-700 font-semibold">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
