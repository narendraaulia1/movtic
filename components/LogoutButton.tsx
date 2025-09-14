"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 w-full px-2 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-colors"
    >
      <LogOut className="w-5 h-5" />
      <span>Logout</span>
    </button>
  )
}
