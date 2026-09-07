'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ExternalLink } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-orange-500/30 shadow-sm">
            <Image
              src="/assets/logo_smk.png"
              alt="Logo SMK Negeri 1 Adiwerna"
              fill
              sizes="40px"
              className="object-contain p-0.5"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-foreground text-base">
                ADAPTIVA-BOT
              </span>
              <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400 text-[10px] font-semibold">
                SMK N 1 ADIWERNA
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              AI WhatsApp Gateway & SPMB Portal
            </p>
          </div>
        </Link>

        {/* Navigation Links (Hanya Portal Publik & Dashboard Admin) */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md transition-colors ${
              pathname === '/'
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Portal Publik
          </Link>
          <Link
            href="/dashboard"
            className={`px-3 py-2 rounded-md transition-colors ${
              pathname?.startsWith('/dashboard')
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Dashboard Admin
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">

          <a
            href="http://localhost:3000/reference"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:inline-flex"
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              Scalar Docs
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Button>
          </a>

          <a
            href="https://wa.me/6285292677431"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat WhatsApp Bot
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
