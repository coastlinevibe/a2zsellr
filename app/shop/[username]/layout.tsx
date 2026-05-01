import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  params: {
    username: string
  }
}

export default function UsernameLayout({ children, params }: LayoutProps) {
  return children
}
