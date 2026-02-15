import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["jobs", "housing", "services", "forsale", "general"];

const DAILY_LIFE_COMMUNITIES: Record<string, string> = {
  en: "DailyLife",
  fr: "VieQuotidienne",
  es: "VidaDiaria",
  tr: "GunlukYasam",
  de: "Alltagsleben",
  ja: "NichijouSeikatsu",
  hi: "DainikJeevan",
  pt: "VidaDiariaPT",
  ru: "PovsednevnayaZhizn",
  it: "VitaQuotidiana",
};

const LANG_CONFIG: Record<string, { categories: Record<string, string>; prompt: string }> = {
  en: {
    categories: { jobs: "Jobs", housing: "Housing", services: "Services-EN", forsale: "ForSale", general: "General-EN" },
    prompt: `You generate realistic classified-style posts for a Craigslist-style community website in English. Each post must have a title and content. Reference concrete details: price, location, timing, requirements, availability. No vague phrasing. No emojis. Natural human tone.`,
  },
  fr: {
    categories: { jobs: "Emploi", housing: "Logement", services: "Services-FR", forsale: "Ventes", general: "General-FR" },
    prompt: `Vous générez des annonces réalistes pour un site communautaire de type Craigslist en français. Chaque annonce doit avoir un titre et un contenu. Mentionnez des détails concrets : prix, localisation, horaires, exigences, disponibilité. Pas de formulations vagues. Pas d'emojis. Ton humain et naturel.`,
  },
  es: {
    categories: { jobs: "Empleos", housing: "Vivienda", services: "Servicios", forsale: "Ventas", general: "General-ES" },
    prompt: `Generas publicaciones realistas estilo clasificados para un sitio comunitario tipo Craigslist en español. Cada publicación debe tener título y contenido. Menciona detalles concretos: precio, ubicación, horarios, requisitos, disponibilidad. Sin frases vagas. Sin emojis. Tono humano y natural.`,
  },
  tr: {
    categories: { jobs: "İş-İlanları", housing: "Konut", services: "Hizmetler", forsale: "Satılık", general: "Genel" },
    prompt: `Craigslist tarzı bir topluluk sitesi için Türkçe gerçekçi ilan tarzında gönderiler oluşturuyorsunuz. Her gönderinin bir başlığı ve içeriği olmalıdır. Somut ayrıntılar belirtin: fiyat, konum, zamanlama, gereksinimler, müsaitlik. Belirsiz ifadeler yok. Emoji yok. Doğal insan tonu.`,
  },
  de: {
    categories: { jobs: "Stellenangebote", housing: "Wohnung", services: "Dienstleistungen", forsale: "Verkauf", general: "Allgemein" },
    prompt: `Sie erstellen realistische Kleinanzeigen für eine Craigslist-ähnliche Community-Website auf Deutsch. Jeder Beitrag muss einen Titel und Inhalt haben. Nennen Sie konkrete Details: Preis, Standort, Zeitplan, Anforderungen, Verfügbarkeit. Keine vagen Formulierungen. Keine Emojis. Natürlicher menschlicher Ton.`,
  },
  ja: {
    categories: { jobs: "求人情報", housing: "住宅情報", services: "サービス", forsale: "売ります", general: "一般掲示板" },
    prompt: `Craigslistスタイルのコミュニティサイト向けに、日本語でリアルなクラシファイド広告を作成してください。各投稿にはタイトルと内容が必要です。具体的な詳細を記載してください：価格、場所、時間、要件、空き状況。曖昧な表現は不可。絵文字は不可。自然な人間のトーンで。`,
  },
  hi: {
    categories: { jobs: "नौकरियां", housing: "आवास", services: "सेवाएं", forsale: "बिक्री", general: "सामान्य" },
    prompt: `आप Craigslist शैली की एक सामुदायिक वेबसाइट के लिए हिंदी में यथार्थवादी वर्गीकृत-शैली के पोस्ट बनाते हैं। प्रत्येक पोस्ट में एक शीर्षक और सामग्री होनी चाहिए। ठोस विवरण दें: कीमत, स्थान, समय, आवश्यकताएं, उपलब्धता। अस्पष्ट भाषा नहीं। इमोजी नहीं। प्राकृतिक मानवीय लहजा।`,
  },
  pt: {
    categories: { jobs: "Empregos", housing: "Moradia", services: "Serviços", forsale: "Vendas-PT", general: "Geral" },
    prompt: `Você gera publicações realistas no estilo classificados para um site comunitário tipo Craigslist em português. Cada publicação deve ter título e conteúdo. Mencione detalhes concretos: preço, localização, horários, requisitos, disponibilidade. Sem frases vagas. Sem emojis. Tom humano e natural.`,
  },
  ru: {
    categories: { jobs: "Вакансии", housing: "Жильё", services: "Услуги", forsale: "Продажа", general: "Общее" },
    prompt: `Вы создаёте реалистичные объявления для сайта сообщества в стиле Craigslist на русском языке. Каждое объявление должно иметь заголовок и содержание. Указывайте конкретные детали: цена, местоположение, время, требования, доступность. Без расплывчатых формулировок. Без эмодзи. Естественный человеческий тон.`,
  },
  it: {
    categories: { jobs: "Lavoro", housing: "Alloggio", services: "Servizi", forsale: "Vendita", general: "Generale" },
    prompt: `Generi annunci realistici in stile classificati per un sito comunitario tipo Craigslist in italiano. Ogni annuncio deve avere un titolo e un contenuto. Menziona dettagli concreti: prezzo, posizione, orari, requisiti, disponibilità. Niente frasi vaghe. Niente emoji. Tono umano e naturale.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const targetLangs: string[] = body.languages || ["en", "fr", "es", "tr", "de", "ja", "hi", "pt", "ru", "it"];
    const postsPerLang: number = body.count || 10;
    const postType: string = body.post_type || "dailylife";

    // Fetch users to attribute posts to
    const { data: users } = await supabase
      .from("profiles")
      .select("user_id, username")
      .limit(50);

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch community IDs per language
    const { data: communities } = await supabase
      .from("communities")
      .select("id, name, language_code");

    if (!communities || communities.length === 0) {
      return new Response(JSON.stringify({ error: "No communities found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { lang: string; posted: number; errors: string[] }[] = [];

    for (const lang of targetLangs) {
      const config = LANG_CONFIG[lang];
      if (!config) continue;

      const langResult = { lang, posted: 0, errors: [] as string[] };

      // Resolve community IDs for this language
      const communityMap: Record<string, string> = {};
      for (const [cat, communityName] of Object.entries(config.categories)) {
        const found = communities.find(
          (c) => c.name === communityName && c.language_code === lang
        );
        if (found) communityMap[cat] = found.id;
      }

      if (Object.keys(communityMap).length === 0) {
        langResult.errors.push("No matching communities found");
        results.push(langResult);
        continue;
      }

      // Build prompt based on post type
      let userPrompt: string;
      let systemPrompt: string;

      if (postType === "jokes") {
        const jokeSystemPrompts: Record<string, string> = {
          en: "You generate funny, family-friendly jokes and humorous posts in English. Each joke should have a title (setup) and content (punchline/full joke). Mix different joke styles: puns, one-liners, observational humor, dad jokes, and short funny stories. Keep it clean and entertaining.",
          fr: "Vous générez des blagues drôles et familiales en français. Chaque blague doit avoir un titre (mise en place) et un contenu (chute/blague complète). Mélangez différents styles : jeux de mots, blagues courtes, humour d'observation. Gardez le tout propre et divertissant.",
          es: "Generas chistes graciosos y aptos para toda la familia en español. Cada chiste debe tener un título (planteamiento) y contenido (remate/chiste completo). Mezcla diferentes estilos: juegos de palabras, chistes cortos, humor observacional. Mantenlo limpio y entretenido.",
          tr: "Türkçe komik ve aile dostu şakalar üretiyorsunuz. Her şakanın bir başlığı (giriş) ve içeriği (espri/tam şaka) olmalıdır. Farklı stilleri karıştırın: kelime oyunları, kısa fıkralar, gözlemsel mizah. Temiz ve eğlenceli tutun.",
          de: "Sie erstellen lustige, familienfreundliche Witze auf Deutsch. Jeder Witz muss einen Titel (Aufbau) und Inhalt (Pointe/ganzer Witz) haben. Mischen Sie verschiedene Stile: Wortspiele, Einzeiler, Beobachtungshumor. Halten Sie es sauber und unterhaltsam.",
          ja: "日本語で面白くて家族向けのジョークを作成してください。各ジョークにはタイトル（前振り）と内容（オチ/全文）が必要です。異なるスタイルを混ぜてください：駄洒落、一発ギャグ、あるあるネタ。清潔で楽しいものにしてください。",
          hi: "आप हिंदी में मज़ेदार और परिवार के अनुकूल चुटकुले बनाते हैं। प्रत्येक चुटकुले में एक शीर्षक (सेटअप) और सामग्री (पंचलाइन/पूरा चुटकुला) होनी चाहिए। विभिन्न शैलियों को मिलाएं: शब्द खेल, छोटे चुटकुले, अवलोकन हास्य। इसे साफ़ और मनोरंजक रखें।",
          pt: "Você gera piadas engraçadas e familiares em português. Cada piada deve ter um título (preparação) e conteúdo (punchline/piada completa). Misture diferentes estilos: trocadilhos, piadas curtas, humor observacional. Mantenha limpo e divertido.",
          ru: "Вы создаёте смешные, семейные шутки на русском языке. Каждая шутка должна иметь заголовок (завязка) и содержание (кульминация/полная шутка). Смешивайте разные стили: каламбуры, короткие анекдоты, наблюдательный юмор. Держите чисто и развлекательно.",
          it: "Generi barzellette divertenti e adatte a tutta la famiglia in italiano. Ogni barzelletta deve avere un titolo (premessa) e contenuto (battuta finale/barzelletta completa). Mescola diversi stili: giochi di parole, battute brevi, umorismo osservazionale. Mantieni pulito e divertente.",
        };
        systemPrompt = jokeSystemPrompts[lang] || jokeSystemPrompts["en"];
        userPrompt = `Generate exactly ${postsPerLang} funny jokes or humorous posts.
Each must belong to the "general" category.

Return ONLY valid JSON with this structure:
{
  "posts": [
    {"category": "general", "title": "Short joke title or setup", "content": "Full joke with punchline"},
    ...
  ]
}

No explanations. No markdown. Only JSON.`;
      } else if (postType === "trivia") {
        const triviaSystemPrompts: Record<string, string> = {
          en: "You create fun trivia questions and answers in English. Each post has a title (the trivia question) and content (the answer with a brief interesting explanation). Cover diverse topics: science, history, geography, pop culture, sports, nature, technology, food, music, movies. Make them engaging and educational.",
          fr: "Vous créez des questions et réponses de culture générale en français. Chaque post a un titre (la question) et un contenu (la réponse avec une brève explication intéressante). Couvrez des sujets variés : science, histoire, géographie, culture pop, sports, nature, technologie, gastronomie, musique, cinéma.",
          es: "Creas preguntas y respuestas de trivia divertidas en español. Cada post tiene un título (la pregunta) y contenido (la respuesta con una breve explicación interesante). Cubre temas diversos: ciencia, historia, geografía, cultura pop, deportes, naturaleza, tecnología, gastronomía, música, cine.",
          tr: "Türkçe eğlenceli bilgi yarışması soruları ve cevapları oluşturuyorsunuz. Her gönderinin bir başlığı (soru) ve içeriği (cevap ve kısa ilginç açıklama) vardır. Çeşitli konuları kapsar: bilim, tarih, coğrafya, popüler kültür, spor, doğa, teknoloji, yemek, müzik, sinema.",
          de: "Sie erstellen unterhaltsame Quizfragen und Antworten auf Deutsch. Jeder Beitrag hat einen Titel (die Frage) und Inhalt (die Antwort mit einer kurzen interessanten Erklärung). Decken Sie vielfältige Themen ab: Wissenschaft, Geschichte, Geografie, Popkultur, Sport, Natur, Technologie, Essen, Musik, Filme.",
          ja: "日本語で楽しいトリビアクイズを作成してください。各投稿にはタイトル（質問）と内容（答えと簡単な興味深い説明）があります。多様なトピックをカバー：科学、歴史、地理、ポップカルチャー、スポーツ、自然、テクノロジー、食べ物、音楽、映画。",
          hi: "आप हिंदी में मज़ेदार ट्रिविया प्रश्न और उत्तर बनाते हैं। प्रत्येक पोस्ट में एक शीर्षक (प्रश्न) और सामग्री (उत्तर और संक्षिप्त दिलचस्प व्याख्या) होती है। विविध विषयों को कवर करें: विज्ञान, इतिहास, भूगोल, पॉप कल्चर, खेल, प्रकृति, प्रौद्योगिकी, भोजन, संगीत, सिनेमा।",
          pt: "Você cria perguntas e respostas de curiosidades divertidas em português. Cada post tem um título (a pergunta) e conteúdo (a resposta com uma breve explicação interessante). Cubra temas diversos: ciência, história, geografia, cultura pop, esportes, natureza, tecnologia, gastronomia, música, cinema.",
          ru: "Вы создаёте интересные вопросы и ответы викторины на русском языке. Каждый пост имеет заголовок (вопрос) и содержание (ответ с кратким интересным объяснением). Охватывайте разнообразные темы: наука, история, география, поп-культура, спорт, природа, технологии, еда, музыка, кино.",
          it: "Crei domande e risposte di curiosità divertenti in italiano. Ogni post ha un titolo (la domanda) e contenuto (la risposta con una breve spiegazione interessante). Copri argomenti diversi: scienza, storia, geografia, cultura pop, sport, natura, tecnologia, gastronomia, musica, cinema.",
        };
        systemPrompt = triviaSystemPrompts[lang] || triviaSystemPrompts["en"];
        userPrompt = `Generate exactly ${postsPerLang} trivia questions and answers.
Each must belong to the "general" category.

Return ONLY valid JSON with this structure:
{
  "posts": [
    {"category": "general", "title": "Trivia question here?", "content": "Answer: [answer]. [Brief interesting explanation]"},
    ...
  ]
}

No explanations. No markdown. Only JSON.`;
      } else if (postType === "dailylife") {
        const dailyLifeSystemPrompts: Record<string, string> = {
          en: "You generate engaging daily life discussion questions for a community forum in English. Topics include: cooking, relationships, work-life balance, hobbies, travel, health, parenting, money tips, home improvement, fashion, pets, fitness, technology in daily life, neighborhood stories, commuting, weekend plans, and personal growth. Each post should spark conversation. Natural human tone, no emojis.",
          fr: "Vous générez des questions de discussion sur la vie quotidienne pour un forum communautaire en français. Sujets : cuisine, relations, équilibre travail-vie, loisirs, voyages, santé, parentalité, astuces financières, bricolage, mode, animaux, fitness, technologie au quotidien, histoires de quartier, trajets, plans de week-end, développement personnel. Ton naturel, pas d'emojis.",
          es: "Generas preguntas de discusión sobre la vida diaria para un foro comunitario en español. Temas: cocina, relaciones, equilibrio trabajo-vida, pasatiempos, viajes, salud, crianza, consejos de dinero, mejoras del hogar, moda, mascotas, fitness, tecnología diaria, historias del barrio, transporte, planes de fin de semana, crecimiento personal. Tono natural, sin emojis.",
          tr: "Bir topluluk forumu için Türkçe günlük yaşam tartışma soruları oluşturuyorsunuz. Konular: yemek, ilişkiler, iş-yaşam dengesi, hobiler, seyahat, sağlık, ebeveynlik, para ipuçları, ev tadilatı, moda, evcil hayvanlar, fitness, günlük teknoloji, mahalle hikayeleri, ulaşım, hafta sonu planları, kişisel gelişim. Doğal ton, emoji yok.",
          de: "Sie erstellen ansprechende Diskussionsfragen zum Alltag für ein Community-Forum auf Deutsch. Themen: Kochen, Beziehungen, Work-Life-Balance, Hobbys, Reisen, Gesundheit, Erziehung, Geldtipps, Heimwerken, Mode, Haustiere, Fitness, Technologie im Alltag, Nachbarschaftsgeschichten, Pendeln, Wochenendpläne, persönliche Entwicklung. Natürlicher Ton, keine Emojis.",
          ja: "日本語でコミュニティフォーラム向けの日常生活に関する議論の質問を作成してください。トピック：料理、人間関係、ワークライフバランス、趣味、旅行、健康、子育て、お金のコツ、DIY、ファッション、ペット、フィットネス、日常のテクノロジー、ご近所の話、通勤、週末の計画、自己成長。自然なトーン、絵文字なし。",
          hi: "आप हिंदी में एक सामुदायिक फोरम के लिए दैनिक जीवन पर चर्चा के प्रश्न बनाते हैं। विषय: खाना पकाना, रिश्ते, कार्य-जीवन संतुलन, शौक, यात्रा, स्वास्थ्य, पालन-पोषण, पैसे की युक्तियां, घर सुधार, फैशन, पालतू जानवर, फिटनेस, दैनिक प्रौद्योगिकी, पड़ोस की कहानियां, आवागमन, सप्ताहांत योजनाएं, व्यक्तिगत विकास। प्राकृतिक लहजा, इमोजी नहीं।",
          pt: "Você gera perguntas de discussão sobre a vida diária para um fórum comunitário em português. Temas: culinária, relacionamentos, equilíbrio trabalho-vida, hobbies, viagens, saúde, parentalidade, dicas de dinheiro, melhorias domésticas, moda, animais de estimação, fitness, tecnologia no dia a dia, histórias do bairro, deslocamento, planos de fim de semana, crescimento pessoal. Tom natural, sem emojis.",
          ru: "Вы создаёте увлекательные вопросы для обсуждения повседневной жизни на форуме сообщества на русском языке. Темы: кулинария, отношения, баланс работы и жизни, хобби, путешествия, здоровье, воспитание детей, финансовые советы, ремонт дома, мода, домашние животные, фитнес, технологии в быту, истории из района, поездки на работу, планы на выходные, саморазвитие. Естественный тон, без эмодзи.",
          it: "Generi domande di discussione sulla vita quotidiana per un forum comunitario in italiano. Argomenti: cucina, relazioni, equilibrio lavoro-vita, hobby, viaggi, salute, genitorialità, consigli sui soldi, miglioramenti domestici, moda, animali domestici, fitness, tecnologia quotidiana, storie di quartiere, pendolarismo, piani per il weekend, crescita personale. Tono naturale, niente emoji.",
        };
        systemPrompt = dailyLifeSystemPrompts[lang] || dailyLifeSystemPrompts["en"];
        userPrompt = `Generate exactly ${postsPerLang} engaging daily life discussion questions that people would want to answer and discuss.
Each must belong to the "general" category.
Mix topics: some about food/cooking, some about work, some about relationships, some about hobbies, some about money, some about health, etc.
Each post title should be a compelling question. The content should add context or a personal angle to spark discussion.

Return ONLY valid JSON with this structure:
{
  "posts": [
    {"category": "general", "title": "What's your go-to weeknight dinner when you're too tired to cook?", "content": "I usually end up making pasta or ordering takeout, but I'm trying to find quick healthy alternatives. What do you all do when cooking feels like too much effort after a long day?"},
    ...
  ]
}

No explanations. No markdown. Only JSON.`;
      } else {
        systemPrompt = config.prompt;
        userPrompt = `Generate exactly ${postsPerLang} classified-style posts.
Each post must belong to one of these categories: ${CATEGORIES.join(", ")}.
Distribute roughly evenly across categories.

Return ONLY valid JSON with this structure:
{
  "posts": [
    {"category": "jobs", "title": "Short title here", "content": "Detailed post content with concrete details"},
    ...
  ]
}

No explanations. No markdown. Only JSON.`;
      }

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!aiResponse.ok) {
          langResult.errors.push(`AI error: ${aiResponse.status}`);
          results.push(langResult);
          continue;
        }

        const aiData = await aiResponse.json();
        let rawContent = aiData.choices?.[0]?.message?.content?.trim() || "";

        // Strip markdown code fences if present
        rawContent = rawContent.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");

        let parsed: { posts: { category: string; title: string; content: string }[] };
        try {
          parsed = JSON.parse(rawContent);
        } catch {
          langResult.errors.push("Failed to parse AI JSON response");
          results.push(langResult);
          continue;
        }

        if (!parsed.posts || !Array.isArray(parsed.posts)) {
          langResult.errors.push("Invalid AI response structure");
          results.push(langResult);
          continue;
        }

        // Insert posts
        for (const post of parsed.posts) {
          let communityId: string | undefined;

          if (postType === "dailylife") {
            // Route daily life posts to dedicated Daily Life community
            const dailyLifeName = DAILY_LIFE_COMMUNITIES[lang];
            const dailyLifeCommunity = communities.find(
              (c) => c.name === dailyLifeName && c.language_code === lang
            );
            communityId = dailyLifeCommunity?.id || communityMap["general"];
          } else {
            const cat = post.category?.toLowerCase() || "general";
            communityId = communityMap[cat] || communityMap["general"];
          }
          if (!communityId) continue;

          const randomUser = users[Math.floor(Math.random() * users.length)];

          const { error: insertError } = await supabase.from("posts").insert({
            title: post.title,
            content: post.content,
            community_id: communityId,
            author_id: randomUser.user_id,
            language_code: lang,
          });

          if (insertError) {
            langResult.errors.push(insertError.message);
          } else {
            langResult.posted++;
          }
        }
      } catch (err) {
        langResult.errors.push(err instanceof Error ? err.message : "Unknown error");
      }

      // Delay between languages to avoid rate limiting
      await new Promise((r) => setTimeout(r, 2000));

      results.push(langResult);
    }

    const totalPosted = results.reduce((s, r) => s + r.posted, 0);

    return new Response(
      JSON.stringify({ success: true, total_posted: totalPosted, details: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-ai-posts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
