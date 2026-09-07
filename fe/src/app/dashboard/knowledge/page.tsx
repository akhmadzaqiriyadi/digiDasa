'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useSchoolKnowledge,
  useSyncKnowledge,
  useCreateCustomEntity,
  useUpdateCustomEntity,
  useDeleteCustomEntity,
  useCreateJurusan,
  useUpdateJurusan,
  useDeleteJurusan,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq
} from '@/hooks/use-knowledge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  JurusanItem,
  FaqItem,
  CustomEntity,
  CreateEntitySchema,
  CreateEntityInput,
  CreateJurusanSchema,
  CreateJurusanInput,
  CreateFaqSchema,
  CreateFaqInput
} from '@/lib/schemas';
import { Pagination } from '@/components/common/pagination';
import {
  Database,
  GraduationCap,
  HelpCircle,
  Plus,
  RefreshCw,
  Trash2,
  Pencil,
  Layers,
  Search,
  X,
  Filter,
  Sparkles
} from 'lucide-react';

const CATEGORY_PRESETS = [
  'PENGUMUMAN',
  'BEASISWA',
  'TATA_TERTIB',
  'FASILITAS',
  'KERJASAMA_INDUSTRI',
  'MAGANG_LUAR_NEGERI',
  'EKSTRAKURIKULER'
];

export default function KnowledgeDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('ALL');
  const [entityCategoryFilter, setEntityCategoryFilter] = useState('ALL');

  const [jurusanPage, setJurusanPage] = useState(1);
  const [faqPage, setFaqPage] = useState(1);
  const [entityPage, setEntityPage] = useState(1);

  const JURUSAN_PER_PAGE = 6;
  const FAQ_PER_PAGE = 5;
  const ENTITY_PER_PAGE = 4;

  // Dialog states for CRUD
  const [jurusanModalOpen, setJurusanModalOpen] = useState(false);
  const [editingJurusan, setEditingJurusan] = useState<JurusanItem | null>(null);

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  const [entityModalOpen, setEntityModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<CustomEntity | null>(null);

  // Queries & Mutations
  const { data: knowledgeResponse, isLoading } = useSchoolKnowledge();
  const syncMutation = useSyncKnowledge();

  const createJurusanMutation = useCreateJurusan();
  const updateJurusanMutation = useUpdateJurusan();
  const deleteJurusanMutation = useDeleteJurusan();

  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();

  const createEntityMutation = useCreateCustomEntity();
  const updateEntityMutation = useUpdateCustomEntity();
  const deleteEntityMutation = useDeleteCustomEntity();

  // Forms
  const {
    register: registerJurusan,
    handleSubmit: handleSubmitJurusan,
    reset: resetJurusan,
    setValue: setValueJurusan,
    formState: { errors: errorsJurusan }
  } = useForm<CreateJurusanInput>({
    resolver: zodResolver(CreateJurusanSchema),
    defaultValues: {
      kode: '',
      nama: '',
      kuota: 72,
      akreditasi: 'A (Unggul)',
      deskripsi: '',
      prospek_kerja: ''
    }
  });

  const {
    register: registerFaq,
    handleSubmit: handleSubmitFaq,
    reset: resetFaq,
    setValue: setValueFaq,
    formState: { errors: errorsFaq }
  } = useForm<CreateFaqInput>({
    resolver: zodResolver(CreateFaqSchema),
    defaultValues: {
      q: '',
      a: '',
      category: 'SPMB',
      order: 0
    }
  });

  const {
    register: registerEntity,
    handleSubmit: handleSubmitEntity,
    reset: resetEntity,
    setValue: setValueEntity,
    watch: watchEntity,
    formState: { errors: errorsEntity }
  } = useForm<CreateEntityInput>({
    resolver: zodResolver(CreateEntitySchema),
    defaultValues: {
      category: 'PENGUMUMAN',
      title: '',
      content: '',
      order: 0
    }
  });

  const selectedEntityCategory = watchEntity('category');

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

  // Open Handlers for CRUD
  const handleOpenAddJurusan = () => {
    setEditingJurusan(null);
    resetJurusan({
      kode: '',
      nama: '',
      kuota: 72,
      akreditasi: 'A (Unggul)',
      deskripsi: '',
      prospek_kerja: ''
    });
    setJurusanModalOpen(true);
  };

  const handleOpenEditJurusan = (j: JurusanItem) => {
    setEditingJurusan(j);
    setValueJurusan('kode', j.kode);
    setValueJurusan('nama', j.nama);
    setValueJurusan('kuota', Number(j.kuota) || 72);
    setValueJurusan('akreditasi', j.akreditasi || 'A (Unggul)');
    setValueJurusan('deskripsi', j.deskripsi || '');
    setValueJurusan('prospek_kerja', Array.isArray(j.peluang_karir) ? j.peluang_karir.join(', ') : '');
    setJurusanModalOpen(true);
  };

  const onSubmitJurusan = (data: CreateJurusanInput) => {
    if (editingJurusan) {
      updateJurusanMutation.mutate(
        { kode: editingJurusan.kode, payload: data },
        {
          onSuccess: () => {
            setJurusanModalOpen(false);
            setEditingJurusan(null);
          }
        }
      );
    } else {
      createJurusanMutation.mutate(data, {
        onSuccess: () => {
          setJurusanModalOpen(false);
          resetJurusan();
        }
      });
    }
  };

  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    resetFaq({
      q: '',
      a: '',
      category: 'SPMB',
      order: 0
    });
    setFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setValueFaq('q', faq.q);
    setValueFaq('a', faq.a);
    setValueFaq('category', faq.category || 'SPMB');
    setValueFaq('order', faq.order || 0);
    setFaqModalOpen(true);
  };

  const onSubmitFaq = (data: CreateFaqInput) => {
    if (editingFaq && editingFaq.id) {
      updateFaqMutation.mutate(
        { id: editingFaq.id, payload: data },
        {
          onSuccess: () => {
            setFaqModalOpen(false);
            setEditingFaq(null);
          }
        }
      );
    } else {
      createFaqMutation.mutate(data, {
        onSuccess: () => {
          setFaqModalOpen(false);
          resetFaq();
        }
      });
    }
  };

  const handleOpenAddEntity = () => {
    setEditingEntity(null);
    resetEntity({
      category: 'PENGUMUMAN',
      title: '',
      content: '',
      order: 0
    });
    setEntityModalOpen(true);
  };

  const handleOpenEditEntity = (ent: CustomEntity) => {
    setEditingEntity(ent);
    setValueEntity('category', ent.category);
    setValueEntity('title', ent.title);
    setValueEntity('content', ent.content);
    setValueEntity('order', ent.order || 0);
    setEntityModalOpen(true);
  };

  const onSubmitEntity = (data: CreateEntityInput) => {
    if (editingEntity) {
      updateEntityMutation.mutate(
        { id: editingEntity.id, payload: data },
        {
          onSuccess: () => {
            setEntityModalOpen(false);
            setEditingEntity(null);
          }
        }
      );
    } else {
      createEntityMutation.mutate(data, {
        onSuccess: () => {
          setEntityModalOpen(false);
          resetEntity();
        }
      });
    }
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
            Sumber pengetahuan resmi AI Gemini: Jurusan Kejuruan, FAQ SPMB, dan Entitas Kustom Sekolah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Sinkronisasi...' : 'Sinkronkan DB'}
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAddEntity}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Entitas
          </Button>
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
              className="text-xs h-9 text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
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
          <TabsTrigger value="jurusans" className="text-xs gap-1.5 cursor-pointer">
            <GraduationCap className="h-3.5 w-3.5" />
            Jurusan Unggulan ({filteredJurusans.length})
          </TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs gap-1.5 cursor-pointer">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ Populer ({filteredFaqs.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs gap-1.5 cursor-pointer">
            <Layers className="h-3.5 w-3.5" />
            Entitas Dinamis ({filteredEntities.length})
          </TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* Tab 1: Jurusans (Full CRUD) */}
        {/* ========================================== */}
        <TabsContent value="jurusans" className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <p className="text-xs text-muted-foreground">
              Kelola konsentrasi keahlian, kuota daya tampung, dan prospek karir yang dikenali AI
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAddJurusan}
              className="text-xs h-8 gap-1.5 border-orange-500/40 text-orange-600 hover:bg-orange-500/10 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Jurusan
            </Button>
          </div>

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
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-3 text-xs cursor-pointer">
                Reset Pencarian
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedJurusans.map((j: JurusanItem) => (
                  <Card key={j.kode} className="border-border/80 shadow-sm flex flex-col justify-between hover:border-orange-500/40 transition">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold">
                          {j.kode}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditJurusan(j)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit Jurusan"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete AlertDialog */}
                          <AlertDialog>
                            <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md text-xs h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Jurusan {j.kode}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus jurusan <strong>{j.nama}</strong> ({j.kode})? Informasi kurikulum dan kuota jurusan ini tidak akan lagi dijawab oleh AI bot.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteJurusanMutation.mutate(j.kode)}
                                  className="bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                                >
                                  Ya, Hapus Jurusan
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
                          <p className="text-[11px] text-foreground mt-0.5 line-clamp-2">
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

        {/* ========================================== */}
        {/* Tab 2: FAQs (Full CRUD) */}
        {/* ========================================== */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {faqCategories.length > 0 ? (
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
            ) : <div />}

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAddFaq}
              className="text-xs h-8 gap-1.5 border-orange-500/40 text-orange-600 hover:bg-orange-500/10 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah FAQ
            </Button>
          </div>

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
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-3 text-xs cursor-pointer">
                    Reset Pencarian
                  </Button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border/60">
                    {paginatedFaqs.map((faq: FaqItem, idx: number) => (
                      <div key={faq.id || idx} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {faq.category && (
                                <Badge variant="secondary" className="text-[10px] font-semibold uppercase">
                                  {faq.category}
                                </Badge>
                              )}
                              <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                                {faq.q}
                              </h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line pl-0.5">
                              {faq.a}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditFaq(faq)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Edit FAQ"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md text-xs h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Pertanyaan FAQ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus FAQ: &ldquo;{faq.q}&rdquo;?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => faq.id && deleteFaqMutation.mutate(faq.id)}
                                    className="bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                                  >
                                    Ya, Hapus FAQ
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

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

        {/* ========================================== */}
        {/* Tab 3: Custom Entities (Full CRUD) */}
        {/* ========================================== */}
        <TabsContent value="custom" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {entityCategories.length > 0 ? (
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
            ) : <div />}

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAddEntity}
              className="text-xs h-8 gap-1.5 border-orange-500/40 text-orange-600 hover:bg-orange-500/10 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Entitas
            </Button>
          </div>

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
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-3 text-xs cursor-pointer">
                Reset Pencarian
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedEntities.map((ent: CustomEntity) => (
                  <Card key={ent.id} className="border-border/80 shadow-sm flex flex-col justify-between hover:border-orange-500/40 transition">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400">
                          {ent.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditEntity(ent)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit Entitas"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md text-xs h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Entitas Pengetahuan?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus <strong>{ent.title}</strong>? Pengetahuan ini akan dihapus dari grounding AI.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteEntityMutation.mutate(ent.id)}
                                  className="bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                                >
                                  Ya, Hapus Entitas
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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

      {/* ============================================================== */}
      {/* 1. Modal Dialog: Tambah / Edit Jurusan                          */}
      {/* ============================================================== */}
      <Dialog open={jurusanModalOpen} onOpenChange={setJurusanModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmitJurusan(onSubmitJurusan)}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingJurusan ? `Edit Jurusan (${editingJurusan.kode})` : 'Tambah Program Jurusan Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Informasi program jurusan akan otomatis diintegrasikan ke memory AI untuk menjawab pertanyaan PPDB.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Kode Jurusan</label>
                  <Input
                    placeholder="Contoh: RPL, TKJ, TBSM"
                    {...registerJurusan('kode')}
                    disabled={Boolean(editingJurusan)}
                    className="text-xs uppercase"
                  />
                  {errorsJurusan.kode && (
                    <p className="text-[11px] text-destructive">{errorsJurusan.kode.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Daya Tampung (Kuota)</label>
                  <Input
                    type="number"
                    placeholder="Contoh: 72"
                    {...registerJurusan('kuota')}
                    className="text-xs"
                  />
                  {errorsJurusan.kuota && (
                    <p className="text-[11px] text-destructive">{errorsJurusan.kuota.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nama Lengkap Jurusan</label>
                <Input
                  placeholder="Contoh: Rekayasa Perangkat Lunak & AI Automation"
                  {...registerJurusan('nama')}
                  className="text-xs"
                />
                {errorsJurusan.nama && (
                  <p className="text-[11px] text-destructive">{errorsJurusan.nama.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Deskripsi &amp; Fokus Pembelajaran</label>
                <Textarea
                  rows={3}
                  placeholder="Fokus keahlian, materi praktik, sertifikasi..."
                  {...registerJurusan('deskripsi')}
                  className="text-xs resize-none"
                />
                {errorsJurusan.deskripsi && (
                  <p className="text-[11px] text-destructive">{errorsJurusan.deskripsi.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Prospek Karir (Pisahkan dengan koma)</label>
                <Input
                  placeholder="Contoh: Web Developer, DevOps Engineer, IT Support"
                  {...registerJurusan('prospek_kerja')}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setJurusanModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createJurusanMutation.isPending || updateJurusanMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs cursor-pointer"
              >
                {createJurusanMutation.isPending || updateJurusanMutation.isPending
                  ? 'Menyimpan...'
                  : editingJurusan
                  ? 'Perbarui Jurusan'
                  : 'Simpan Jurusan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* 2. Modal Dialog: Tambah / Edit FAQ                             */}
      {/* ============================================================== */}
      <Dialog open={faqModalOpen} onOpenChange={setFaqModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmitFaq(onSubmitFaq)}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingFaq ? 'Edit Pertanyaan FAQ' : 'Tambah Tanya Jawab (FAQ) Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                FAQ ini menjadi rujukan utama AI bot dalam menjawab pertanyaan umum calon siswa.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Kategori FAQ</label>
                <Input
                  placeholder="Contoh: SPMB, BIAYA, SYARAT, SERAGAM"
                  {...registerFaq('category')}
                  className="text-xs uppercase"
                />
                {errorsFaq.category && (
                  <p className="text-[11px] text-destructive">{errorsFaq.category.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Pertanyaan</label>
                <Input
                  placeholder="Contoh: Apakah boleh mendaftar jika nilai rapor semester 1 kurang?"
                  {...registerFaq('q')}
                  className="text-xs"
                />
                {errorsFaq.q && (
                  <p className="text-[11px] text-destructive">{errorsFaq.q.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Jawaban Resmi</label>
                <Textarea
                  rows={4}
                  placeholder="Tuliskan jawaban yang ramah, akurat, dan sesuai kebijakan sekolah..."
                  {...registerFaq('a')}
                  className="text-xs resize-none"
                />
                {errorsFaq.a && (
                  <p className="text-[11px] text-destructive">{errorsFaq.a.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFaqModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs cursor-pointer"
              >
                {createFaqMutation.isPending || updateFaqMutation.isPending
                  ? 'Menyimpan...'
                  : editingFaq
                  ? 'Perbarui FAQ'
                  : 'Simpan FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* 3. Modal Dialog: Tambah / Edit Custom Entity                   */}
      {/* ============================================================== */}
      <Dialog open={entityModalOpen} onOpenChange={setEntityModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmitEntity(onSubmitEntity)}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingEntity ? 'Edit Entitas Pengetahuan' : 'Tambah Entitas Pengetahuan Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Entitas baru akan langsung diindeks oleh AI Gemini untuk menjawab pertanyaan siswa secara real-time.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pilih / Ketik Kategori</label>
                <Input
                  placeholder="Contoh: BEASISWA, TATA_TERTIB, SERAGAM"
                  {...registerEntity('category')}
                  className="text-xs uppercase"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-orange-500" /> Contoh Kategori:
                  </span>
                  {CATEGORY_PRESETS.map((preset) => (
                    <Badge
                      key={preset}
                      variant={selectedEntityCategory === preset ? 'default' : 'outline'}
                      className="cursor-pointer text-[10px] hover:bg-orange-500/20"
                      onClick={() => setValueEntity('category', preset)}
                    >
                      {preset}
                    </Badge>
                  ))}
                </div>

                {errorsEntity.category && (
                  <p className="text-[11px] text-destructive">{errorsEntity.category.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Judul / Topik Pengetahuan</label>
                <Input
                  placeholder="Contoh: Beasiswa Prestasi Tahfidz & Keringanan Seragam KIP"
                  {...registerEntity('title')}
                  className="text-xs"
                />
                {errorsEntity.title && (
                  <p className="text-[11px] text-destructive">{errorsEntity.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Isi Pengetahuan Lengkap</label>
                <Textarea
                  rows={4}
                  placeholder="Tuliskan detail aturan, rincian biaya, syarat pengajuan, atau jadwal kegiatan..."
                  {...registerEntity('content')}
                  className="text-xs resize-none"
                />
                {errorsEntity.content && (
                  <p className="text-[11px] text-destructive">{errorsEntity.content.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEntityModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createEntityMutation.isPending || updateEntityMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs cursor-pointer"
              >
                {createEntityMutation.isPending || updateEntityMutation.isPending
                  ? 'Menyimpan...'
                  : editingEntity
                  ? 'Perbarui Entitas'
                  : 'Simpan ke Database'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
