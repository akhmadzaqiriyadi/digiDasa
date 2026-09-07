'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { LayoutDashboard, MessageSquare, Database, Ticket, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { getSystemStatus } from '@/lib/api/tickets';

const navItems = [
  { href: '/dashboard', label: 'Ringkasan & Metrik', icon: LayoutDashboard },
  { href: '/dashboard/whatsapp', label: 'WhatsApp Gateway & QR', icon: MessageSquare },
  { href: '/dashboard/knowledge', label: 'Basis Pengetahuan (SPMB)', icon: Database },
  { href: '/dashboard/tickets', label: 'Tiket Eskalasi Siswa', icon: Ticket },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const { data: status } = useQuery({
    queryKey: queryKeys.system.status(),
    queryFn: getSystemStatus,
    refetchInterval: 10000,
  });

  const isOnline = Boolean(status?.system?.status === 'ONLINE' || status?.server === 'ONLINE');

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 flex-1">
        {/* Dashboard Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Pusat Kendali ADAPTIVA-BOT
              </h1>
              <Badge
                variant={isOnline ? 'default' : 'secondary'}
                className={isOnline ? 'bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5' : 'gap-1.5'}
              >
                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-200 animate-pulse' : 'bg-amber-400'}`} />
                {isOnline ? 'SYSTEM ONLINE' : 'CHECKING...'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Panel Pengelolaan AI WhatsApp Gateway, SPMB Knowledge Base, dan Layanan Eskalasi Siswa
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 text-orange-500" />
              <span>Model: <strong>Google Gemini 2.5 Flash</strong></span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-border/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Child Pages */}
        {children}
      </div>

      <Footer />
    </div>
  );
}
