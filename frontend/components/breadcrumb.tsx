"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-white mb-4 mt-2.5">
      <Link href="/" className="flex items-center hover:text-gray-700 transition-colors">
        <Home className="h-4 w-4" />
        <span className="ml-1">Página inicial</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.href ? (
            item.onClick ? (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  item.onClick?.()
                }}
                className="hover:text-gray-700 transition-colors truncate max-w-[200px] text-left"
                title={item.label}
              >
                {item.label.length > 30 ? `${item.label.substring(0, 30)}...` : item.label}
              </button>
            ) : (
              <Link
                href={item.href}
                className="hover:text-gray-700 transition-colors truncate max-w-[200px]"
                title={item.label}
              >
                {item.label.length > 30 ? `${item.label.substring(0, 30)}...` : item.label}
              </Link>
            )
          ) : (
            <span className="font-medium truncate max-w-[200px] text-white" title={item.label}>
              {item.label.length > 30 ? `${item.label.substring(0, 30)}...` : item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
