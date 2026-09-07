'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { getTickets, resolveTicket } from '@/lib/api/tickets';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function TicketsDashboardPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const {
    data: tickets = [],
    isLoading,
    isRefetching,
    refetch
  } = useQuery({
    queryKey: queryKeys.tickets.list(filterStatus),
    queryFn: () => getTickets(filterStatus),
    refetchInterval: 5000,
  });

  const resolveMutation = useMutation({
    mutationFn: resolveTicket,
    onSuccess: (data) => {
      toast.success(data.message || 'Tiket berhasil diselesaikan panitia!');
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.system.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menyelesaikan tiket: ${err.message}`);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-amber-500" />
            Daftar Tiket Eskalasi Panitia (Human Escalation)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Percakapan siswa/orang tua yang membutuhkan verifikasi manual atau kasus dispensasi khusus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`} />
            Segarkan Data
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="ALL" className="text-xs">Semua Tiket</TabsTrigger>
            <TabsTrigger value="OPEN" className="text-xs">Menunggu Respons (OPEN)</TabsTrigger>
            <TabsTrigger value="RESOLVED" className="text-xs">Terselesaikan (RESOLVED)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-dashed p-12 text-center text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">Tidak Ada Tiket Eskalasi</h3>
            <p className="text-xs mt-1">
              {filterStatus === 'OPEN'
                ? 'Semua tiket eskalasi telah selesai ditangani oleh tim panitia!'
                : 'Belum ada data tiket eskalasi yang tercatat di database.'}
            </p>
          </Card>
        ) : (
          tickets.map((t) => {
            const isOpen = t.status === 'OPEN';
            return (
              <Card
                key={t.id}
                className={`border-border/80 shadow-sm transition ${
                  isOpen ? 'border-l-4 border-l-amber-500 bg-amber-500/[0.02]' : 'border-l-4 border-l-emerald-500'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isOpen ? 'outline' : 'secondary'}
                        className={
                          isOpen
                            ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold text-xs'
                            : 'bg-emerald-500/10 text-emerald-600 font-semibold text-xs'
                        }
                      >
                        {isOpen ? 'OPEN • MENUNGGU PANITIA' : 'RESOLVED'}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {t.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(t.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Pengirim: <strong>{t.senderNumber}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span>Alasan: <strong>{t.reason}</strong></span>
                    </div>
                  </div>

                  {t.summary && (
                    <div className="p-3 bg-muted/40 rounded-lg text-xs text-foreground/90 border border-border/50 leading-relaxed">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                        Ringkasan Kasus Chat:
                      </span>
                      {t.summary}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
                    <a
                      href={`https://wa.me/${t.senderNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Hubungi via WhatsApp
                      </Button>
                    </a>

                    {isOpen && (
                      <Button
                        size="sm"
                        onClick={() => resolveMutation.mutate(t.id)}
                        disabled={resolveMutation.isPending}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {resolveMutation.isPending ? 'Memproses...' : 'Tandai Selesai (Resolve)'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
