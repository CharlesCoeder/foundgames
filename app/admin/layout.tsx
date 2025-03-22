"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Home, Table, Upload, Building, Loader2 } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Verifications", href: "/admin/verifications", icon: Users },
  { label: "Residents", href: "/admin/residents", icon: Table },
  { label: "Import Residents", href: "/admin/import", icon: Upload },
  { label: "Buildings", href: "/admin/buildings", icon: Building },
  // Other admin nav items
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        setIsLoading(true);

        const supabase = createClient();

        // Check if user is logged in
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!user) {
          // Silently redirect to login without console error
          router.push("/login?redirect=" + encodeURIComponent(pathname));
          return;
        }

        // Check if user is an admin - try to fetch the profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          router.push("/");
          return;
        }

        // Check if the user has admin role
        // The column might be 'role', 'user_role', etc. depending on your schema
        if (!profile || profile.role !== "admin") {
          router.push("/");
          return;
        }

        // User is authenticated and is an admin
        setIsAdmin(true);
      } catch (error) {
        // Handle errors silently
        console.error("Admin access check error:", error);
        router.push("/login?redirect=" + encodeURIComponent(pathname));
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminAccess();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // This prevents flickering while redirecting
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
