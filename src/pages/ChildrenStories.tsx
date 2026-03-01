import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChildrenStory {
  id: string;
  story_number: number;
  title: string;
  summary: string;
  content: string;
  moral: string;
  image_url: string | null;
  language_code: string;
  age_range: string;
  read_time: number;
}

const storyLabels: Record<string, { pageTitle: string; subtitle: string; back: string; readMore: string; moral: string; more: string; notFound: string; loading: string; noStories: string; ages: string; min: string }> = {
  en: { pageTitle: "Children's Stories", subtitle: "Magical bedtime stories for little dreamers", back: "Back to Stories", readMore: "Read", moral: "Moral", more: "More Stories", notFound: "Story Not Found", loading: "Loading stories...", noStories: "No stories yet", ages: "Ages", min: "min" },
  tr: { pageTitle: "Çocuk Hikayeleri", subtitle: "Küçük hayalperestler için sihirli uyku masalları", back: "Hikayelere Dön", readMore: "Oku", moral: "Ders", more: "Diğer Hikayeler", notFound: "Hikaye Bulunamadı", loading: "Hikayeler yükleniyor...", noStories: "Henüz hikaye yok", ages: "Yaş", min: "dk" },
  fr: { pageTitle: "Histoires pour Enfants", subtitle: "Des histoires magiques pour les petits rêveurs", back: "Retour aux histoires", readMore: "Lire", moral: "Morale", more: "Plus d'histoires", notFound: "Histoire non trouvée", loading: "Chargement...", noStories: "Pas encore d'histoires", ages: "Âges", min: "min" },
  es: { pageTitle: "Cuentos Infantiles", subtitle: "Cuentos mágicos para pequeños soñadores", back: "Volver a los cuentos", readMore: "Leer", moral: "Moraleja", more: "Más cuentos", notFound: "Cuento no encontrado", loading: "Cargando...", noStories: "Aún no hay cuentos", ages: "Edades", min: "min" },
  de: { pageTitle: "Kindergeschichten", subtitle: "Magische Gutenachtgeschichten für kleine Träumer", back: "Zurück zu den Geschichten", readMore: "Lesen", moral: "Moral", more: "Mehr Geschichten", notFound: "Geschichte nicht gefunden", loading: "Laden...", noStories: "Noch keine Geschichten", ages: "Alter", min: "Min" },
  ja: { pageTitle: "子どものお話", subtitle: "小さな夢見る子どもたちのための魔法のおやすみ話", back: "お話一覧に戻る", readMore: "読む", moral: "教訓", more: "もっとお話", notFound: "お話が見つかりません", loading: "読み込み中...", noStories: "まだお話がありません", ages: "対象年齢", min: "分" },
  hi: { pageTitle: "बच्चों की कहानियाँ", subtitle: "छोटे सपने देखने वालों के लिए जादुई कहानियाँ", back: "कहानियों पर वापस", readMore: "पढ़ें", moral: "सीख", more: "और कहानियाँ", notFound: "कहानी नहीं मिली", loading: "लोड हो रहा है...", noStories: "अभी तक कोई कहानी नहीं", ages: "उम्र", min: "मिनट" },
  pt: { pageTitle: "Histórias Infantis", subtitle: "Histórias mágicas para pequenos sonhadores", back: "Voltar às histórias", readMore: "Ler", moral: "Moral", more: "Mais histórias", notFound: "História não encontrada", loading: "Carregando...", noStories: "Nenhuma história ainda", ages: "Idades", min: "min" },
  ru: { pageTitle: "Детские Сказки", subtitle: "Волшебные сказки на ночь для маленьких мечтателей", back: "Назад к сказкам", readMore: "Читать", moral: "Мораль", more: "Ещё сказки", notFound: "Сказка не найдена", loading: "Загрузка...", noStories: "Пока нет сказок", ages: "Возраст", min: "мин" },
  it: { pageTitle: "Storie per Bambini", subtitle: "Storie magiche della buonanotte per piccoli sognatori", back: "Torna alle storie", readMore: "Leggi", moral: "Morale", more: "Altre storie", notFound: "Storia non trovata", loading: "Caricamento...", noStories: "Nessuna storia ancora", ages: "Età", min: "min" },
};

const ChildrenStories = () => {
  const { storyId } = useParams();
  const { language } = useLanguage();
  const { navigate, localePath } = useLocalizedNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [stories, setStories] = useState<ChildrenStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<ChildrenStory | null>(null);

  const labels = storyLabels[language] || storyLabels.en;

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("children_stories" as any)
        .select("*")
        .eq("language_code", language)
        .order("story_number", { ascending: true });

      if (!error && data) {
        setStories(data as unknown as ChildrenStory[]);
      }
      setLoading(false);
    };
    fetchStories();
  }, [language]);

  useEffect(() => {
    if (storyId && stories.length > 0) {
      const story = stories.find((s) => s.id === storyId || s.story_number === parseInt(storyId));
      setSelectedStory(story || null);
    } else {
      setSelectedStory(null);
    }
  }, [storyId, stories]);

  // Detail view
  if (storyId && selectedStory) {
    const otherStories = stories.filter((s) => s.id !== selectedStory.id).slice(0, 3);

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onCreatePost={() => {}} onMenuToggle={() => {}} onOpenAuth={openAuth} />
        <main className="flex-1 py-6 px-4 lg:px-6">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate("/stories")} className="mb-4 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {labels.back}
            </Button>

            <article>
              {selectedStory.image_url && (
                <img
                  src={selectedStory.image_url}
                  alt={selectedStory.title}
                  className="w-full h-64 sm:h-80 object-cover rounded-xl mb-6"
                  loading="lazy"
                />
              )}
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">{labels.ages} {selectedStory.age_range}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedStory.read_time} {labels.min}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{selectedStory.title}</h1>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                {selectedStory.content.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-foreground/90 leading-relaxed mb-4">{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {labels.moral}
                </p>
                <p className="mt-1 text-foreground/80">{selectedStory.moral}</p>
              </div>
            </article>

            {otherStories.length > 0 && (
              <section className="mt-12 pt-8 border-t border-border">
                <h2 className="text-xl font-semibold mb-4">{labels.more}</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {otherStories.map((s) => (
                    <Link key={s.id} to={localePath(`/stories/${s.story_number}`)} className="group">
                      <div className="rounded-lg border border-border overflow-hidden bg-card hover:shadow-md transition-shadow">
                        {s.image_url && (
                          <img src={s.image_url} alt={s.title} className="w-full h-32 object-cover" loading="lazy" />
                        )}
                        <div className="p-3">
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">{s.title}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
        <Footer />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
      </div>
    );
  }

  // Not found state
  if (storyId && !loading && !selectedStory) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onCreatePost={() => {}} onMenuToggle={() => {}} onOpenAuth={openAuth} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{labels.notFound}</h1>
            <Button variant="outline" onClick={() => navigate("/stories")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {labels.back}
            </Button>
          </div>
        </main>
        <Footer />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
      </div>
    );
  }

  // Listing view
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCreatePost={() => {}} onMenuToggle={() => {}} onOpenAuth={openAuth} />
      <main className="flex-1 py-6 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">📚</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{labels.pageTitle}</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{labels.subtitle}</p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden bg-card">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{labels.noStories}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {stories.map((story) => (
                <Link key={story.id} to={localePath(`/stories/${story.story_number}`)} className="group">
                  <div className="rounded-xl border border-border overflow-hidden bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                    {story.image_url && (
                      <div className="relative">
                        <img
                          src={story.image_url}
                          alt={story.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                            {labels.ages} {story.age_range}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {story.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {story.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {story.read_time} {labels.min}
                        </span>
                        <span className="text-xs text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                          {labels.readMore} <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </div>
  );
};

export default ChildrenStories;
