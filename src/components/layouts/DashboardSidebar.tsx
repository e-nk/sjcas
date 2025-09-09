'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  BarChart3,
  Settings,
  ChevronRight,
  X,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Students',
    icon: Users,
    children: [
      { name: 'All Students', href: '/students' },
      { name: 'Add Student', href: '/students/add' },
      { name: 'Promote Students', href: '/students/promote' },
    ],
  },
  {
    name: 'Fee Management',
    icon: DollarSign,
    children: [
      { name: 'Fee Structures', href: '/fees/structures' },
      { name: 'Fee Groups', href: '/fees/groups' },
      { name: 'Fee Assignments', href: '/fees/assignments' },
    ],
  },
  {
    name: 'Payments',
    icon: CreditCard,
    children: [
      { name: 'All Payments', href: '/payments' },
      { name: 'Record Payment', href: '/payments/record' },
      { name: 'Unmatched Payments', href: '/payments/unmatched' },
    ],
  },
  {
    name: 'Reports',
    icon: BarChart3,
    children: [
      { name: 'Fee Collection', href: '/reports/fee-collection' },
      { name: 'Outstanding Fees', href: '/reports/outstanding' },
      { name: 'Student Statements', href: '/reports/student-statements' },
    ],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Students', 'Fee Management'])

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-16 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="lg:hidden p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto flex"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-between text-left font-normal',
                        'hover:bg-gray-50'
                      )}
                      onClick={() => toggleExpanded(item.name)}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 text-gray-400 transition-transform',
                          expandedItems.includes(item.name) && 'rotate-90'
                        )}
                      />
                    </Button>
                    
                    {expandedItems.includes(item.name) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href}>
                            <Button
                              variant="ghost"
                              className={cn(
                                'w-full justify-start text-left font-normal pl-4',
                                pathname === child.href
                                  ? 'bg-school-primary-red/10 text-school-primary-red border-r-2 border-school-primary-red'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              )}
                              onClick={() => {
                                // Close mobile menu when navigating
                                if (window.innerWidth < 1024) {
                                  onClose()
                                }
                              }}
                            >
                              {child.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.href!}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        pathname === item.href
                          ? 'bg-school-primary-red/10 text-school-primary-red border-r-2 border-school-primary-red'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      onClick={() => {
                        // Close mobile menu when navigating
                        if (window.innerWidth < 1024) {
                          onClose()
                        }
                      }}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}