'use client'

import Link from 'next/link'
import { useState, ReactNode } from 'react'

interface LoadingLinkProps {
  href: string | object
  children: ReactNode
  className?: string
  onClick?: (e: any) => void
  [key: string]: any
}

export default function LoadingLink({ href, children, className = '', onClick, ...props }: LoadingLinkProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = (e: any) => {
    setLoading(true)
    if (onClick) onClick(e)
    setTimeout(() => {
      setLoading(false)
    }, 800)
  }

  return (
    <Link 
      href={href as any} 
      onClick={handleClick} 
      className={`${className} flex items-center justify-center gap-2`} 
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {children}
    </Link>
  )
}
