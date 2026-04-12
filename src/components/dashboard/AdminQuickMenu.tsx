"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu as MenuIcon, 
  X,
  ShieldCheck,
  Landmark
} from "lucide-react"
import { MenuContainer, MenuItem } from "@/components/ui/fluid-menu"

export function AdminQuickMenu() {
  const router = useRouter()

  return (
    <div className="fixed bottom-8 right-8 z-[100] md:bottom-12 md:right-12">
      <MenuContainer>
        {/* Toggle Trigger */}
        <MenuItem 
          icon={
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:rotate-180 flex items-center justify-center">
                <MenuIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0 flex items-center justify-center">
                <X className="w-6 h-6 text-primary" />
              </div>
            </div>
          } 
        />
        
        {/* Dashboard Home */}
        <MenuItem 
          onClick={() => router.push("/dashboard")}
          icon={<LayoutDashboard className="w-6 h-6 text-foreground" />}
        />

        {/* Student Directory */}
        <MenuItem 
          onClick={() => router.push("/dashboard/students")}
          icon={<Users className="w-6 h-6 text-foreground" />}
        />

        {/* Payment Verifications */}
        <MenuItem 
          onClick={() => router.push("/dashboard/verifications")}
          icon={<ShieldCheck className="w-6 h-6 text-foreground" />}
        />

        {/* Payment Processing */}
        <MenuItem 
          onClick={() => router.push("/dashboard/payments")}
          icon={<Landmark className="w-6 h-6 text-foreground" />}
        />

        {/* Logout */}
        <MenuItem 
          onClick={() => signOut({ callbackUrl: "/login" })}
          icon={<LogOut className="w-6 h-6 text-destructive" />}
        />
      </MenuContainer>
    </div>
  )
}
