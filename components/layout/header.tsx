// "use client"

// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { useAuth } from "@/hooks/use-auth"
// import { LogOut, User, Settings } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { Navigation } from "./navigation"

// export function Header() {
//   const { user, logout } = useAuth()
//   const { toast } = useToast()

//   const handleLogout = async () => {
//     try {
//       await logout()
//       toast({
//         title: "Signed out successfully",
//         description: "See you next time!",
//       })
//     } catch (error: any) {
//       toast({
//         title: "Error signing out",
//         description: error.message,
//         variant: "destructive",
//       })
//     }
//   }

//   const getUserInitials = (name: string | null) => {
//     if (!name) return "U"
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2)
//   }

//   return (
//     <header className="border-b bg-card">
//       <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <h1 className="text-xl font-bold text-primary">Expense Tracker</h1>
//           <Navigation />
//         </div>

//         <div className="flex items-center space-x-4">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//                 <Avatar className="h-8 w-8">
//                   <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
//                   <AvatarFallback>{getUserInitials(user?.displayName || user?.email)}</AvatarFallback>
//                 </Avatar>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="w-56" align="end" forceMount>
//               <DropdownMenuLabel className="font-normal">
//                 <div className="flex flex-col space-y-1">
//                   <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
//                   <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
//                 </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>
//                 <User className="mr-2 h-4 w-4" />
//                 <span>Profile</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Settings className="mr-2 h-4 w-4" />
//                 <span>Settings</span>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={handleLogout}>
//                 <LogOut className="mr-2 h-4 w-4" />
//                 <span>Log out</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </header>
//   )
// }


"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, User, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Navigation } from "./navigation"

export function Header() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      toast({ title: "Signed out successfully", description: "See you next time!" })
      router.push("/")
    } catch (error: any) {
      toast({ title: "Error signing out", description: error.message, variant: "destructive" })
    }
  }

  const handleSettings = () => router.push("/settings")
  const handleProfile = () => router.push("/profile")

  const getUserInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Expense Tracker</h1>
        <Navigation />
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
            <AvatarFallback>{getUserInitials(user?.displayName || user?.email)}</AvatarFallback>
          </Avatar>

          {/* Profile Button */}
          <Button variant="outline" size="sm" onClick={handleProfile} className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Button>

          {/* Settings Button */}
          <Button variant="outline" size="sm" onClick={handleSettings} className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>

          {/* Logout Button */}
          <Button variant="destructive" size="sm" onClick={handleLogout} className="flex items-center space-x-1">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
