import HomeClient from "@/app/components/home-client"
import { getCurrentUserFromCookies } from "@/lib/auth"

export default async function Home() {
  const user = await getCurrentUserFromCookies()

  return <HomeClient user={user} />
}
