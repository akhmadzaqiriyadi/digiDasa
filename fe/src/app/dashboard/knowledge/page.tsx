'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { getSchoolKnowledge, syncKnowledgeFromDb, createCustomEntity, deleteCustomEntity } from '@/lib/api/knowledge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { JurusanItem, FaqItem, CustomEntity } from '@/lib/schemas';
import {
  Database,
  GraduationCap,
  HelpCircle,
  Plus,
  RefreshCw,
  Trash2,
  Layers
} from 'lucide-react';

export default function KnowledgeDashboardPage() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntity, setNewEntity] = useState({
    category: 'PENGUMUMAN',
    title: '',
    content: '',
  });

  const {
    data: knowledgeResponse,
    isLoading,
  } = useQuery({
    queryKey: queryKeys.knowledge.detail(),
    queryFn: getSchoolKnowledge,
  });

  const syncMutation = useMutation({
    mutationFn: syncKnowledgeFromDb,
    onSuccess: (data) => {
      toast.success(data.message || 'Sinkronisasi basis data PostgreSQL berhasil!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal sinkronisasi: ${err.message}`);
    },
  });

  const createEntityMutation = useMutation({
    mutationFn: createCustomEntity,
    onSuccess: () => {
      toast.success('Entitas pengetahuan baru berhasil disimpan ke PostgreSQL!');
      setIsAddModalOpen(false);
      setNewEntity({ category: 'PENGUMUMAN', title: '', content: '' });
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menambahkan data: ${err.message}`);
    },
  });

  const deleteEntityMutation = useMutation({
    mutationFn: deleteCustomEntity,
    onSuccess: () => {
      toast.success('Entitas pengetahuan berhasil dihapus!');
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menghapus data: ${err.message}`);
    },
  });

  const kData = knowledgeResponse?.data;
  const jurusans = kData?.jurusans || [];
  const faqs = kData?.faq_populer || [];
  const entities = kData?.custom_entities || [];

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity.title.trim() || !newEntity.content.trim()) {
      toast.warning('Judul dan konten wajib diisi!');
      return;
    }
    createEntityMutation.mutate(newEntity);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-500" />
            Basis Pengetahuan Sekolah (Grounded Knowledge)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sumber pengetahuan resmi AI Gemini: 9 Jurusan, Dokumen SK SPMB, dan Entitas Kustom
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Sinkronisasi...' : 'Sinkronkan DB'}
          </Button>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md font-medium text-xs h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white gap-1.5 cursor-pointer transition">
              <Plus className="h-3.5 w-3.5" />
              Tambah Entitas
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleCreateEntity}>
                <DialogHeader>
                  <DialogTitle className="text-base font-bold">Tambah Entitas Pengetahuan Baru</DialogTitle>
                  <DialogDescription className="text-xs">
                    Entitas baru akan langsung diindeks oleh AI Gemini untuk menjawab pertanyaan siswa.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Kategori</label>
                    <Input
                      placeholder="Contoh: BEASISWA, TATA_TERTIB, SERAGAM"
                      value={newEntity.category}
                      onChange={(e) => setNewEntity({ ...newEntity, category: e.target.value.toUpperCase() })}
                      className="text-xs uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Judul / Topik</label>
                    <Input
                      placeholder="Contoh: Beasiswa Prestasi Jalur Tahfidz & KIP"
                      value={newEntity.title}
                      onChange={(e) => setNewEntity({ ...newEntity, title: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Isi Pengetahuan Lengkap</label>
                    <Textarea
                      rows={4}
                      placeholder="Tuliskan detail aturan, rincian biaya, atau jadwal..."
                      value={newEntity.content}
                      onChange={(e) => setNewEntity({ ...newEntity, content: e.target.value })}
                      className="text-xs resize-none"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createEntityMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                  >
                    {createEntityMutation.isPending ? 'Menyimpan...' : 'Simpan ke Database'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="jurusans" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="jurusans" className="text-xs gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            9 Jurusan Unggulan ({jurusans.length})
          </TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ Populer ({faqs.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Entitas Dinamis ({entities.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Jurusans */}
        <TabsContent value="jurusans" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jurusans.map((j: JurusanItem) => (
                <Card key={j.kode} className="border-border/80 shadow-sm flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold">
                        {j.kode}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Akreditasi {j.akreditasi}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold mt-2">
                      {j.nama}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {j.deskripsi}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2 text-xs space-y-2">
                    {j.peluang_karir && j.peluang_karir.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Prospek Karir:
                        </span>
                        <p className="text-[11px] text-foreground mt-0.5">
                          {j.peluang_karir.slice(0, 3).join(', ')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: FAQs */}
        <TabsContent value="faqs" className="space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Daftar Tanya Jawab Resmi (FAQ)</CardTitle>
              <CardDescription className="text-xs">
                Pertanyaan yang paling sering ditanyakan oleh calon siswa & orang tua murid
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <Accordion className="w-full">
                  {faqs.map((faq: FaqItem, idx: number) => (
                    <AccordionItem key={faq.id || idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-xs font-semibold text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Custom Entities */}
        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entities.length === 0 ? (
              <Card className="col-span-2 border-dashed p-8 text-center text-muted-foreground">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">Belum Ada Entitas Pengetahuan Kustom</p>
                <p className="text-xs mt-1">Klik tombol &ldquo;Tambah Entitas&rdquo; untuk menambahkan pengumuman atau beasiswa.</p>
              </Card>
            ) : (
              entities.map((ent: CustomEntity) => (
                <Card key={ent.id} className="border-border/80 shadow-sm flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400">
                        {ent.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntityMutation.mutate(ent.id)}
                        disabled={deleteEntityMutation.isPending}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <CardTitle className="text-sm font-bold mt-2">
                      {ent.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {ent.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
