import { redirect } from "next/navigation"

import HomeClient from "@/app/components/home-client"
import { getCurrentUserFromCookies } from "@/lib/auth"

export default async function Home() {
  const user = await getCurrentUserFromCookies()

  if (!user) {
    redirect("/login")
  }

  return <HomeClient user={user} />
}
