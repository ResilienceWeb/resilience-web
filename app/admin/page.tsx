'use client'
import { useWebs } from '@hooks/webs'

export default function AdminPage() {
  const { webs } = useWebs()

  // console.log(webs)

  return <h1>Admin</h1>
}
