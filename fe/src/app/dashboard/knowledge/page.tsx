'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useSchoolKnowledge,
  useSyncKnowledge,
  useCreateCustomEntity,
  useDeleteCustomEntity
} from '@/hooks/use-knowledge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { JurusanItem, FaqItem, CustomEntity, CreateEntitySchema, CreateEntityInput } from '@/lib/schemas';
import { Pagination } from '@/components/common/pagination';
import {
  Database,
  GraduationCap,
  HelpCircle,
  Plus,
  RefreshCw,
  Trash2,
  Layers,
  Search,
  X,
  Filter
} from 'lucide-react';

export default function KnowledgeDashboardPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('ALL');
  const [entityCategoryFilter, setEntityCategoryFilter] = useState('ALL');

  const [jurusanPage, setJurusanPage] = useState(1);
  const [faqPage, setFaqPage] = useState(1);
  const [entityPage, setEntityPage] = useState(1);

  const JURUSAN_PER_PAGE = 6;
  const FAQ_PER_PAGE = 5;
  const ENTITY_PER_PAGE = 4;

  const { data: knowledgeResponse, isLoading } = useSchoolKnowledge();
  const syncMutation = useSyncKnowledge();
  const createEntityMutation = useCreateCustomEntity();
  const deleteEntityMutation = useDeleteCustomEntity();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateEntityInput>({
    resolver: zodResolver(CreateEntitySchema),
    defaultValues: {
      category: 'PENGUMUMAN',
      title: '',
      content: '',
      order: 0
    }
  });

  const kData = knowledgeResponse?.data;
  const jurusans = React.useMemo(() => kData?.jurusans || [], [kData]);
  const faqs = React.useMemo(() => kData?.faq_populer || [], [kData]);
  const entities = React.useMemo(() => kData?.custom_entities || [], [kData]);

  // 1. Jurusan Filter & Pagination
  const filteredJurusans = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return jurusans;
    return jurusans.filter((j) =>
      j.nama.toLowerCase().includes(q) ||
      j.kode.toLowerCase().includes(q) ||
      (j.deskripsi && j.deskripsi.toLowerCase().includes(q)) ||
      (j.peluang_karir && j.peluang_karir.some((p) => p.toLowerCase().includes(q)))
    );
  }, [jurusans, searchQuery]);

  const totalJurusanPages = Math.ceil(filteredJurusans.length / JURUSAN_PER_PAGE) || 1;
  const paginatedJurusans = filteredJurusans.slice(
    (jurusanPage - 1) * JURUSAN_PER_PAGE,
    jurusanPage * JURUSAN_PER_PAGE
  );

  // 2. FAQ Filter & Pagination
  const faqCategories = React.useMemo(() => {
    const cats = new Set<string>();
    faqs.forEach((f) => {
      if (f.category) cats.add(f.category);
    });
    return Array.from(cats);
  }, [faqs]);

  const filteredFaqs = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return faqs.filter((f) => {
      const matchCat = faqCategoryFilter === 'ALL' || f.category === faqCategoryFilter;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        (f.category && f.category.toLowerCase().includes(q))
      );
    });
  }, [faqs, searchQuery, faqCategoryFilter]);

  const totalFaqPages = Math.ceil(filteredFaqs.length / FAQ_PER_PAGE) || 1;
  const paginatedFaqs = filteredFaqs.slice(
    (faqPage - 1) * FAQ_PER_PAGE,
    faqPage * FAQ_PER_PAGE
  );

  // 3. Custom Entity Filter & Pagination
  const entityCategories = React.useMemo(() => {
    const cats = new Set<string>();
    entities.forEach((e) => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats);
  }, [entities]);

  const filteredEntities = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return entities.filter((e) => {
      const matchCat = entityCategoryFilter === 'ALL' || e.category === entityCategoryFilter;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.tags && e.tags.toLowerCase().includes(q))
      );
    });
  }, [entities, searchQuery, entityCategoryFilter]);

  const totalEntityPages = Math.ceil(filteredEntities.length / ENTITY_PER_PAGE) || 1;
  const paginatedEntities = filteredEntities.slice(
    (entityPage - 1) * ENTITY_PER_PAGE,
    entityPage * ENTITY_PER_PAGE
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setJurusanPage(1);
    setFaqPage(1);
    setEntityPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFaqCategoryFilter('ALL');
    setEntityCategoryFilter('ALL');
    setJurusanPage(1);
    setFaqPage(1);
    setEntityPage(1);
  };

  const onSubmitEntity = (data: CreateEntityInput) => {
    createEntityMutation.mutate(data, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        reset();
      }
    });
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
              <form onSubmit={handleSubmit(onSubmitEntity)}>
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
                      {...register('category')}
                      className="text-xs uppercase"
                    />
                    {errors.category && (
                      <p className="text-[11px] text-red-500 font-medium">{errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Judul / Topik</label>
                    <Input
                      placeholder="Contoh: Beasiswa Prestasi Jalur Tahfidz & KIP"
                      {...register('title')}
                      className="text-xs"
                    />
                    {errors.title && (
                      <p className="text-[11px] text-red-500 font-medium">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Isi Pengetahuan Lengkap</label>
                    <Textarea
                      rows={4}
                      placeholder="Tuliskan detail aturan, rincian biaya, atau jadwal..."
                      {...register('content')}
                      className="text-xs resize-none"
                    />
                    {errors.content && (
                      <p className="text-[11px] text-red-500 font-medium">{errors.content.message}</p>
                    )}
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

      {/* Search & Filter Toolbar */}
      <div className="p-3.5 bg-card border border-border/80 rounded-xl space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari program jurusan, materi keahlian, pertanyaan FAQ, atau entitas kustom..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-8 text-xs h-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {(searchQuery || faqCategoryFilter !== 'ALL' || entityCategoryFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-9 text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3 w-3" />
              Reset Pencarian
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="jurusans" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="jurusans" className="text-xs gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Jurusan Unggulan ({filteredJurusans.length})
          </TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ Populer ({filteredFaqs.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Entitas Dinamis ({filteredEntities.length})
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
          ) : filteredJurusans.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">Tidak Ada Jurusan yang Sesuai</p>
              <p className="text-xs mt-1">Tidak ditemukan program keahlian dengan kata kunci &ldquo;{searchQuery}&rdquo;</p>
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-3 text-xs">
                Reset Pencarian
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedJurusans.map((j: JurusanItem) => (
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
                      {j.kuota && (
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                          <span>Daya Tampung:</span>
                          <span className="font-semibold text-foreground">{j.kuota} Siswa</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Pagination
                currentPage={jurusanPage}
                totalPages={totalJurusanPages}
                totalItems={filteredJurusans.length}
                pageSize={JURUSAN_PER_PAGE}
                onPageChange={setJurusanPage}
              />
            </>
          )}
        </TabsContent>

        {/* Tab 2: FAQs */}
        <TabsContent value="faqs" className="space-y-4">
          {faqCategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Kategori:
              </span>
              <Badge
                variant={faqCategoryFilter === 'ALL' ? 'default' : 'outline'}
                className="cursor-pointer text-[11px]"
                onClick={() => { setFaqCategoryFilter('ALL'); setFaqPage(1); }}
              >
                Semua ({faqs.length})
              </Badge>
              {faqCategories.map((cat) => (
                <Badge
                  key={cat}
                  variant={faqCategoryFilter === cat ? 'default' : 'outline'}
                  className="cursor-pointer text-[11px]"
                  onClick={() => { setFaqCategoryFilter(cat); setFaqPage(1); }}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Daftar Tanya Jawab Resmi (FAQ)</CardTitle>
              <CardDescription className="text-xs">
                Pertanyaan yang paling sering ditanyakan oleh calon siswa & orang tua murid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : filteredFaqs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Search className="h-7 w-7 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">Tidak Ada FAQ yang Cocok</p>
                  <p className="text-xs mt-1">Coba gunakan kata kunci pencarian lain atau pilih kategori &ldquo;Semua&rdquo;</p>
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-3 text-xs">
                    Reset Pencarian
                  </Button>
                </div>
              ) : (
                <>
                  <Accordion className="w-full">
                    {paginatedFaqs.map((faq: FaqItem, idx: number) => (
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

                  <Pagination
                    currentPage={faqPage}
                    totalPages={totalFaqPages}
                    totalItems={filteredFaqs.length}
                    pageSize={FAQ_PER_PAGE}
                    onPageChange={setFaqPage}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Custom Entities */}
        <TabsContent value="custom" className="space-y-4">
          {entityCategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Kategori:
              </span>
              <Badge
                variant={entityCategoryFilter === 'ALL' ? 'default' : 'outline'}
                className="cursor-pointer text-[11px]"
                onClick={() => { setEntityCategoryFilter('ALL'); setEntityPage(1); }}
              >
                Semua ({entities.length})
              </Badge>
              {entityCategories.map((cat) => (
                <Badge
                  key={cat}
                  variant={entityCategoryFilter === cat ? 'default' : 'outline'}
                  className="cursor-pointer text-[11px]"
                  onClick={() => { setEntityCategoryFilter(cat); setEntityPage(1); }}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {entities.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-muted-foreground">
              <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">Belum Ada Entitas Pengetahuan Kustom</p>
              <p className="text-xs mt-1">Klik tombol &ldquo;Tambah Entitas&rdquo; untuk menambahkan pengumuman atau beasiswa.</p>
            </Card>
          ) : filteredEntities.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">Tidak Ada Entitas yang Cocok</p>
              <p className="text-xs mt-1">Tidak ada pengumuman atau entitas dengan kata kunci &ldquo;{searchQuery}&rdquo;</p>
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-3 text-xs">
                Reset Pencarian
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedEntities.map((ent: CustomEntity) => (
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
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 cursor-pointer"
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
                ))}
              </div>

              <Pagination
                currentPage={entityPage}
                totalPages={totalEntityPages}
                totalItems={filteredEntities.length}
                pageSize={ENTITY_PER_PAGE}
                onPageChange={setEntityPage}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
