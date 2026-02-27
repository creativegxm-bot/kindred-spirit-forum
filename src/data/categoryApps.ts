export interface CategoryApp {
  name: string;
  icon: string;
  description: string;
  descriptionTr: string;
  downloadUrl: string;
  imageUrl: string;
  rating: number;
  platform: string;
}

export interface AppCategory {
  slug: string;
  name: string;
  nameTr: string;
  emoji: string;
  apps: CategoryApp[];
}

export const appCategories: AppCategory[] = [
  {
    slug: "games",
    name: "Games",
    nameTr: "Oyunlar",
    emoji: "🎮",
    apps: [
      { name: "Roblox", icon: "🟩", description: "Online game platform with user-created worlds", descriptionTr: "Kullanıcı tarafından oluşturulan dünyalarla çevrimiçi oyun platformu", downloadUrl: "https://www.roblox.com/download", imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200", rating: 4.5, platform: "PC, Mobile" },
      { name: "Minecraft", icon: "⛏️", description: "Sandbox game with infinite creative possibilities", descriptionTr: "Sonsuz yaratıcı olanaklara sahip sandbox oyun", downloadUrl: "https://www.minecraft.net/download", imageUrl: "https://images.unsplash.com/photo-1587573089734-599d584d68f4?w=200", rating: 4.8, platform: "PC, Mobile, Console" },
      { name: "Fortnite", icon: "🔫", description: "Battle royale and creative gaming platform", descriptionTr: "Battle royale ve yaratıcı oyun platformu", downloadUrl: "https://www.fortnite.com/download", imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200", rating: 4.3, platform: "PC, Mobile, Console" },
      { name: "Genshin Impact", icon: "⚔️", description: "Open-world action RPG with stunning visuals", descriptionTr: "Muhteşem görsellere sahip açık dünya aksiyon RPG", downloadUrl: "https://genshin.hoyoverse.com", imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200", rating: 4.6, platform: "PC, Mobile, Console" },
      { name: "Steam", icon: "🎮", description: "The largest PC gaming platform and store", descriptionTr: "En büyük PC oyun platformu ve mağazası", downloadUrl: "https://store.steampowered.com/about/", imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=200", rating: 4.7, platform: "PC" },
      { name: "Epic Games Store", icon: "🏪", description: "PC game store with free weekly games", descriptionTr: "Haftalık ücretsiz oyunlarla PC oyun mağazası", downloadUrl: "https://store.epicgames.com/download", imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200", rating: 4.2, platform: "PC" },
      { name: "Call of Duty: Warzone", icon: "🎯", description: "Free-to-play battle royale shooter", descriptionTr: "Ücretsiz battle royale nişancı oyunu", downloadUrl: "https://www.callofduty.com/warzone", imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=200", rating: 4.1, platform: "PC, Console" },
      { name: "League of Legends", icon: "🏆", description: "Competitive team-based strategy game", descriptionTr: "Rekabetçi takım tabanlı strateji oyunu", downloadUrl: "https://www.leagueoflegends.com", imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=200", rating: 4.4, platform: "PC" },
      { name: "Valorant", icon: "💥", description: "Tactical 5v5 character-based shooter", descriptionTr: "Taktiksel 5v5 karakter tabanlı nişancı", downloadUrl: "https://playvalorant.com", imageUrl: "https://images.unsplash.com/photo-1560253023-3018fe2db42d?w=200", rating: 4.5, platform: "PC" },
      { name: "Among Us", icon: "🚀", description: "Social deduction multiplayer game", descriptionTr: "Sosyal çıkarım çok oyunculu oyun", downloadUrl: "https://www.innersloth.com/games/among-us/", imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200", rating: 4.3, platform: "PC, Mobile" },
      { name: "Apex Legends", icon: "🦁", description: "Free-to-play hero shooter battle royale", descriptionTr: "Ücretsiz kahraman nişancı battle royale", downloadUrl: "https://www.ea.com/games/apex-legends", imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200", rating: 4.3, platform: "PC, Mobile, Console" },
      { name: "Clash Royale", icon: "👑", description: "Real-time strategy card game", descriptionTr: "Gerçek zamanlı strateji kart oyunu", downloadUrl: "https://supercell.com/en/games/clashroyale/", imageUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=200", rating: 4.2, platform: "Mobile" },
      { name: "PUBG Mobile", icon: "🪖", description: "Mobile battle royale survival game", descriptionTr: "Mobil battle royale hayatta kalma oyunu", downloadUrl: "https://www.pubgmobile.com", imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200", rating: 4.1, platform: "Mobile" },
      { name: "Candy Crush Saga", icon: "🍬", description: "Popular match-3 puzzle game", descriptionTr: "Popüler eşleştirme bulmaca oyunu", downloadUrl: "https://www.king.com/game/candycrush", imageUrl: "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=200", rating: 4.4, platform: "Mobile" },
      { name: "Diablo IV", icon: "😈", description: "Dark action RPG dungeon crawler", descriptionTr: "Karanlık aksiyon RPG zindan gezgini", downloadUrl: "https://diablo4.blizzard.com", imageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=200", rating: 4.0, platform: "PC, Console" },
    ],
  },
  {
    slug: "browsers",
    name: "Browsers",
    nameTr: "Tarayıcılar",
    emoji: "🌐",
    apps: [
      { name: "Google Chrome", icon: "🔵", description: "The world's most popular web browser", descriptionTr: "Dünyanın en popüler web tarayıcısı", downloadUrl: "https://www.google.com/chrome/", imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200", rating: 4.5, platform: "PC, Mobile" },
      { name: "Mozilla Firefox", icon: "🦊", description: "Privacy-focused open-source browser", descriptionTr: "Gizlilik odaklı açık kaynak tarayıcı", downloadUrl: "https://www.mozilla.org/firefox/", imageUrl: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=200", rating: 4.4, platform: "PC, Mobile" },
      { name: "Brave Browser", icon: "🦁", description: "Privacy browser with built-in ad blocker", descriptionTr: "Yerleşik reklam engelleyicili gizlilik tarayıcısı", downloadUrl: "https://brave.com/download/", imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "Microsoft Edge", icon: "🔷", description: "Chromium-based browser by Microsoft", descriptionTr: "Microsoft'un Chromium tabanlı tarayıcısı", downloadUrl: "https://www.microsoft.com/edge", imageUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=200", rating: 4.3, platform: "PC, Mobile" },
      { name: "Opera", icon: "🔴", description: "Feature-rich browser with built-in VPN", descriptionTr: "Yerleşik VPN'li zengin özellikli tarayıcı", downloadUrl: "https://www.opera.com/download", imageUrl: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=200", rating: 4.2, platform: "PC, Mobile" },
      { name: "Opera GX", icon: "🎮", description: "Gaming browser with CPU/RAM limiters", descriptionTr: "CPU/RAM sınırlayıcılı oyun tarayıcısı", downloadUrl: "https://www.opera.com/gx", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200", rating: 4.4, platform: "PC" },
      { name: "Vivaldi", icon: "🎵", description: "Highly customizable browser for power users", descriptionTr: "İleri düzey kullanıcılar için özelleştirilebilir tarayıcı", downloadUrl: "https://vivaldi.com/download/", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200", rating: 4.3, platform: "PC, Mobile" },
      { name: "Tor Browser", icon: "🧅", description: "Anonymous browsing through Tor network", descriptionTr: "Tor ağı üzerinden anonim gezinme", downloadUrl: "https://www.torproject.org/download/", imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", rating: 4.1, platform: "PC" },
      { name: "Safari", icon: "🧭", description: "Apple's fast and efficient browser", descriptionTr: "Apple'ın hızlı ve verimli tarayıcısı", downloadUrl: "https://www.apple.com/safari/", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200", rating: 4.3, platform: "Mac, iOS" },
      { name: "Arc Browser", icon: "🌈", description: "Modern browser reimagining the internet", descriptionTr: "İnterneti yeniden hayal eden modern tarayıcı", downloadUrl: "https://arc.net", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200", rating: 4.5, platform: "Mac, Windows" },
      { name: "DuckDuckGo Browser", icon: "🦆", description: "Privacy-first browser by DuckDuckGo", descriptionTr: "DuckDuckGo'nun gizlilik öncelikli tarayıcısı", downloadUrl: "https://duckduckgo.com/app", imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200", rating: 4.2, platform: "Mobile, Mac" },
      { name: "Samsung Internet", icon: "🟣", description: "Feature-rich mobile browser by Samsung", descriptionTr: "Samsung'un zengin özellikli mobil tarayıcısı", downloadUrl: "https://play.google.com/store/apps/details?id=com.sec.android.app.sbrowser", imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200", rating: 4.1, platform: "Android" },
    ],
  },
  {
    slug: "security-privacy",
    name: "Security & Privacy",
    nameTr: "Güvenlik ve Gizlilik",
    emoji: "🔒",
    apps: [
      { name: "NordVPN", icon: "🛡️", description: "Leading VPN service for online privacy", descriptionTr: "Çevrimiçi gizlilik için önde gelen VPN hizmeti", downloadUrl: "https://nordvpn.com/download/", imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "ExpressVPN", icon: "⚡", description: "Fast and secure VPN service", descriptionTr: "Hızlı ve güvenli VPN hizmeti", downloadUrl: "https://www.expressvpn.com/download", imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", rating: 4.5, platform: "PC, Mobile" },
      { name: "1Password", icon: "🔑", description: "Secure password manager for teams and individuals", descriptionTr: "Ekipler ve bireyler için güvenli şifre yöneticisi", downloadUrl: "https://1password.com/downloads/", imageUrl: "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=200", rating: 4.7, platform: "PC, Mobile" },
      { name: "Bitwarden", icon: "🔐", description: "Open-source password manager", descriptionTr: "Açık kaynak şifre yöneticisi", downloadUrl: "https://bitwarden.com/download/", imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "Malwarebytes", icon: "🦠", description: "Anti-malware and cybersecurity software", descriptionTr: "Kötü amaçlı yazılım önleme ve siber güvenlik yazılımı", downloadUrl: "https://www.malwarebytes.com/mwb-download", imageUrl: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=200", rating: 4.4, platform: "PC, Mobile" },
      { name: "Kaspersky", icon: "🛡️", description: "Comprehensive antivirus and security suite", descriptionTr: "Kapsamlı antivirüs ve güvenlik paketi", downloadUrl: "https://www.kaspersky.com/downloads", imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200", rating: 4.3, platform: "PC, Mobile" },
      { name: "ProtonVPN", icon: "🟢", description: "Privacy-focused VPN from Proton", descriptionTr: "Proton'dan gizlilik odaklı VPN", downloadUrl: "https://protonvpn.com/download", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200", rating: 4.5, platform: "PC, Mobile" },
      { name: "Signal", icon: "💬", description: "End-to-end encrypted messaging app", descriptionTr: "Uçtan uca şifreli mesajlaşma uygulaması", downloadUrl: "https://signal.org/download/", imageUrl: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=200", rating: 4.7, platform: "PC, Mobile" },
      { name: "Authy", icon: "🔢", description: "Two-factor authentication app", descriptionTr: "İki faktörlü kimlik doğrulama uygulaması", downloadUrl: "https://authy.com/download/", imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=200", rating: 4.4, platform: "PC, Mobile" },
      { name: "LastPass", icon: "🔒", description: "Password manager and digital vault", descriptionTr: "Şifre yöneticisi ve dijital kasa", downloadUrl: "https://www.lastpass.com/download", imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=200", rating: 4.0, platform: "PC, Mobile" },
      { name: "Norton 360", icon: "✅", description: "All-in-one security and VPN solution", descriptionTr: "Hepsi bir arada güvenlik ve VPN çözümü", downloadUrl: "https://norton.com/downloads", imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200", rating: 4.2, platform: "PC, Mobile" },
      { name: "Surfshark", icon: "🦈", description: "Affordable VPN with unlimited devices", descriptionTr: "Sınırsız cihazlı uygun fiyatlı VPN", downloadUrl: "https://surfshark.com/download", imageUrl: "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=200", rating: 4.4, platform: "PC, Mobile" },
    ],
  },
  {
    slug: "productivity",
    name: "Productivity",
    nameTr: "Verimlilik",
    emoji: "📊",
    apps: [
      { name: "Notion", icon: "📝", description: "All-in-one workspace for notes and projects", descriptionTr: "Notlar ve projeler için hepsi bir arada çalışma alanı", downloadUrl: "https://www.notion.so/desktop", imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=200", rating: 4.7, platform: "PC, Mobile" },
      { name: "Obsidian", icon: "💎", description: "Knowledge base with linked markdown notes", descriptionTr: "Bağlantılı markdown notlarla bilgi tabanı", downloadUrl: "https://obsidian.md/download", imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=200", rating: 4.8, platform: "PC, Mobile" },
      { name: "Todoist", icon: "✅", description: "Task manager and to-do list app", descriptionTr: "Görev yöneticisi ve yapılacaklar listesi", downloadUrl: "https://todoist.com/downloads", imageUrl: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "Trello", icon: "📋", description: "Visual project management with boards", descriptionTr: "Panolarla görsel proje yönetimi", downloadUrl: "https://trello.com/platforms", imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200", rating: 4.4, platform: "PC, Mobile" },
      { name: "Slack", icon: "💬", description: "Team communication and collaboration hub", descriptionTr: "Ekip iletişimi ve iş birliği merkezi", downloadUrl: "https://slack.com/downloads", imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=200", rating: 4.5, platform: "PC, Mobile" },
      { name: "Microsoft 365", icon: "📄", description: "Office suite with Word, Excel, PowerPoint", descriptionTr: "Word, Excel, PowerPoint ile ofis paketi", downloadUrl: "https://www.microsoft.com/microsoft-365/download-office", imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200", rating: 4.5, platform: "PC, Mobile" },
      { name: "Google Workspace", icon: "🟡", description: "Cloud-based productivity and collaboration", descriptionTr: "Bulut tabanlı verimlilik ve iş birliği", downloadUrl: "https://workspace.google.com", imageUrl: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200", rating: 4.6, platform: "Web, Mobile" },
      { name: "Evernote", icon: "🐘", description: "Note-taking and organization app", descriptionTr: "Not alma ve organizasyon uygulaması", downloadUrl: "https://evernote.com/download", imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=200", rating: 4.1, platform: "PC, Mobile" },
      { name: "Asana", icon: "🎯", description: "Work management platform for teams", descriptionTr: "Ekipler için iş yönetimi platformu", downloadUrl: "https://asana.com/download", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200", rating: 4.3, platform: "PC, Mobile" },
      { name: "Calendly", icon: "📅", description: "Automated scheduling and appointment booking", descriptionTr: "Otomatik zamanlama ve randevu alma", downloadUrl: "https://calendly.com", imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=200", rating: 4.5, platform: "Web, Mobile" },
      { name: "ClickUp", icon: "🖱️", description: "All-in-one productivity and project tool", descriptionTr: "Hepsi bir arada verimlilik ve proje aracı", downloadUrl: "https://clickup.com/download", imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=200", rating: 4.4, platform: "PC, Mobile" },
      { name: "Airtable", icon: "📊", description: "Spreadsheet-database hybrid for teams", descriptionTr: "Ekipler için elektronik tablo-veritabanı karışımı", downloadUrl: "https://airtable.com/downloads", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200", rating: 4.5, platform: "PC, Mobile" },
    ],
  },
  {
    slug: "internet-network",
    name: "Internet & Network",
    nameTr: "İnternet ve Ağ",
    emoji: "🌍",
    apps: [
      { name: "Cloudflare WARP", icon: "☁️", description: "Fast and free VPN by Cloudflare", descriptionTr: "Cloudflare'ın hızlı ve ücretsiz VPN'i", downloadUrl: "https://1.1.1.1", imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", rating: 4.3, platform: "PC, Mobile" },
      { name: "Speedtest by Ookla", icon: "⚡", description: "Internet speed testing tool", descriptionTr: "İnternet hız testi aracı", downloadUrl: "https://www.speedtest.net/apps", imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200", rating: 4.5, platform: "PC, Mobile" },
      { name: "FileZilla", icon: "📁", description: "Free FTP client for file transfers", descriptionTr: "Dosya transferleri için ücretsiz FTP istemcisi", downloadUrl: "https://filezilla-project.org/download.php", imageUrl: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=200", rating: 4.2, platform: "PC" },
      { name: "WireGuard", icon: "🔌", description: "Modern and fast VPN protocol", descriptionTr: "Modern ve hızlı VPN protokolü", downloadUrl: "https://www.wireguard.com/install/", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "Wireshark", icon: "🦈", description: "Network protocol analyzer", descriptionTr: "Ağ protokolü analizcisi", downloadUrl: "https://www.wireshark.org/download.html", imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200", rating: 4.4, platform: "PC" },
      { name: "qBittorrent", icon: "📥", description: "Open-source BitTorrent client", descriptionTr: "Açık kaynak BitTorrent istemcisi", downloadUrl: "https://www.qbittorrent.org/download", imageUrl: "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=200", rating: 4.5, platform: "PC" },
      { name: "PuTTY", icon: "💻", description: "Free SSH and Telnet client", descriptionTr: "Ücretsiz SSH ve Telnet istemcisi", downloadUrl: "https://www.putty.org", imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200", rating: 4.1, platform: "PC" },
      { name: "Tailscale", icon: "🔗", description: "Zero-config VPN mesh network", descriptionTr: "Sıfır yapılandırmalı VPN mesh ağı", downloadUrl: "https://tailscale.com/download", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200", rating: 4.7, platform: "PC, Mobile" },
      { name: "Postman", icon: "📮", description: "API development and testing platform", descriptionTr: "API geliştirme ve test platformu", downloadUrl: "https://www.postman.com/downloads/", imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=200", rating: 4.5, platform: "PC" },
      { name: "Ngrok", icon: "🔗", description: "Expose local servers to the internet", descriptionTr: "Yerel sunucuları internete açın", downloadUrl: "https://ngrok.com/download", imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=200", rating: 4.3, platform: "PC" },
    ],
  },
  {
    slug: "multimedia",
    name: "Multimedia",
    nameTr: "Multimedya",
    emoji: "🎬",
    apps: [
      { name: "VLC Media Player", icon: "🔶", description: "Free and open-source media player", descriptionTr: "Ücretsiz ve açık kaynak medya oynatıcı", downloadUrl: "https://www.videolan.org/vlc/", imageUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=200", rating: 4.7, platform: "PC, Mobile" },
      { name: "Spotify", icon: "🟢", description: "Music streaming with millions of songs", descriptionTr: "Milyonlarca şarkıyla müzik akışı", downloadUrl: "https://www.spotify.com/download/", imageUrl: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "DaVinci Resolve", icon: "🎥", description: "Professional video editing software", descriptionTr: "Profesyonel video düzenleme yazılımı", downloadUrl: "https://www.blackmagicdesign.com/products/davinciresolve", imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44v?w=200", rating: 4.8, platform: "PC" },
      { name: "Audacity", icon: "🎤", description: "Free audio editor and recorder", descriptionTr: "Ücretsiz ses editörü ve kaydedici", downloadUrl: "https://www.audacityteam.org/download/", imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200", rating: 4.4, platform: "PC" },
      { name: "OBS Studio", icon: "📹", description: "Free streaming and recording software", descriptionTr: "Ücretsiz yayın ve kayıt yazılımı", downloadUrl: "https://obsproject.com/download", imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=200", rating: 4.7, platform: "PC" },
      { name: "HandBrake", icon: "🍔", description: "Open-source video transcoder", descriptionTr: "Açık kaynak video dönüştürücü", downloadUrl: "https://handbrake.fr/downloads.php", imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200", rating: 4.5, platform: "PC" },
      { name: "GIMP", icon: "🎨", description: "Free image editor alternative to Photoshop", descriptionTr: "Photoshop alternatifi ücretsiz görüntü editörü", downloadUrl: "https://www.gimp.org/downloads/", imageUrl: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200", rating: 4.3, platform: "PC" },
      { name: "Canva", icon: "🖼️", description: "Design platform for social media and more", descriptionTr: "Sosyal medya ve daha fazlası için tasarım platformu", downloadUrl: "https://www.canva.com/download/", imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "Adobe Premiere Pro", icon: "🎞️", description: "Industry-standard video editing", descriptionTr: "Endüstri standardı video düzenleme", downloadUrl: "https://www.adobe.com/products/premiere.html", imageUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200", rating: 4.5, platform: "PC" },
      { name: "Figma", icon: "🎨", description: "Collaborative design and prototyping tool", descriptionTr: "İş birlikçi tasarım ve prototipleme aracı", downloadUrl: "https://www.figma.com/downloads/", imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4eef1d2fa?w=200", rating: 4.8, platform: "PC, Web" },
      { name: "YouTube Music", icon: "🔴", description: "Music streaming by YouTube", descriptionTr: "YouTube'dan müzik akışı", downloadUrl: "https://music.youtube.com", imageUrl: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=200", rating: 4.3, platform: "Mobile, Web" },
      { name: "Plex", icon: "🎬", description: "Personal media server and streaming", descriptionTr: "Kişisel medya sunucusu ve akışı", downloadUrl: "https://www.plex.tv/media-server-downloads/", imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200", rating: 4.4, platform: "PC, Mobile" },
    ],
  },
  {
    slug: "development-it",
    name: "Development & IT",
    nameTr: "Geliştirme ve BT",
    emoji: "💻",
    apps: [
      { name: "Visual Studio Code", icon: "🔵", description: "Popular code editor by Microsoft", descriptionTr: "Microsoft'un popüler kod editörü", downloadUrl: "https://code.visualstudio.com/download", imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200", rating: 4.9, platform: "PC" },
      { name: "GitHub Desktop", icon: "🐙", description: "Git GUI client for version control", descriptionTr: "Sürüm kontrolü için Git GUI istemcisi", downloadUrl: "https://desktop.github.com", imageUrl: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=200", rating: 4.5, platform: "PC" },
      { name: "Docker Desktop", icon: "🐳", description: "Containerization platform for developers", descriptionTr: "Geliştiriciler için konteynerleştirme platformu", downloadUrl: "https://www.docker.com/products/docker-desktop/", imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=200", rating: 4.4, platform: "PC" },
      { name: "JetBrains IntelliJ IDEA", icon: "🧠", description: "Powerful IDE for Java and more", descriptionTr: "Java ve daha fazlası için güçlü IDE", downloadUrl: "https://www.jetbrains.com/idea/download/", imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910auj?w=200", rating: 4.7, platform: "PC" },
      { name: "Sublime Text", icon: "📝", description: "Fast and lightweight text editor", descriptionTr: "Hızlı ve hafif metin editörü", downloadUrl: "https://www.sublimetext.com/download", imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200", rating: 4.4, platform: "PC" },
      { name: "Terminal / iTerm2", icon: "⬛", description: "Enhanced terminal emulator for macOS", descriptionTr: "macOS için geliştirilmiş terminal emülatörü", downloadUrl: "https://iterm2.com/downloads.html", imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200", rating: 4.6, platform: "Mac" },
      { name: "Node.js", icon: "🟩", description: "JavaScript runtime for server-side development", descriptionTr: "Sunucu tarafı geliştirme için JavaScript çalışma zamanı", downloadUrl: "https://nodejs.org/download/", imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=200", rating: 4.7, platform: "PC" },
      { name: "GitKraken", icon: "🦑", description: "Visual Git client with integrations", descriptionTr: "Entegrasyonlu görsel Git istemcisi", downloadUrl: "https://www.gitkraken.com/download", imageUrl: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=200", rating: 4.3, platform: "PC" },
      { name: "Cursor", icon: "✨", description: "AI-powered code editor", descriptionTr: "AI destekli kod editörü", downloadUrl: "https://cursor.sh", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.6, platform: "PC" },
      { name: "Insomnia", icon: "🌙", description: "API client for REST and GraphQL", descriptionTr: "REST ve GraphQL için API istemcisi", downloadUrl: "https://insomnia.rest/download", imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=200", rating: 4.3, platform: "PC" },
      { name: "Warp Terminal", icon: "🚀", description: "Modern terminal with AI built-in", descriptionTr: "Yerleşik AI'lı modern terminal", downloadUrl: "https://www.warp.dev", imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200", rating: 4.5, platform: "Mac, Linux" },
      { name: "Vercel", icon: "▲", description: "Frontend deployment platform", descriptionTr: "Frontend dağıtım platformu", downloadUrl: "https://vercel.com/download", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200", rating: 4.6, platform: "Web, CLI" },
    ],
  },
  {
    slug: "education-reference",
    name: "Education & Reference",
    nameTr: "Eğitim ve Referans",
    emoji: "📚",
    apps: [
      { name: "Duolingo", icon: "🦉", description: "Language learning made fun and free", descriptionTr: "Dil öğrenmeyi eğlenceli ve ücretsiz yapan uygulama", downloadUrl: "https://www.duolingo.com/mobile", imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200", rating: 4.7, platform: "Mobile, Web" },
      { name: "Khan Academy", icon: "🎓", description: "Free online courses and education", descriptionTr: "Ücretsiz çevrimiçi kurslar ve eğitim", downloadUrl: "https://www.khanacademy.org/downloads", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200", rating: 4.8, platform: "Mobile, Web" },
      { name: "Coursera", icon: "📖", description: "Online courses from top universities", descriptionTr: "En iyi üniversitelerden çevrimiçi kurslar", downloadUrl: "https://www.coursera.org/mobile", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200", rating: 4.5, platform: "Mobile, Web" },
      { name: "Anki", icon: "🃏", description: "Spaced repetition flashcard app", descriptionTr: "Aralıklı tekrar flash kart uygulaması", downloadUrl: "https://apps.ankiweb.net", imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "Grammarly", icon: "✏️", description: "AI writing assistant for grammar and style", descriptionTr: "Dilbilgisi ve stil için AI yazma asistanı", downloadUrl: "https://www.grammarly.com/desktop", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200", rating: 4.5, platform: "PC, Mobile" },
      { name: "Quizlet", icon: "🔤", description: "Study tools with flashcards and quizzes", descriptionTr: "Flash kartlar ve quizlerle çalışma araçları", downloadUrl: "https://quizlet.com/mobile", imageUrl: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=200", rating: 4.4, platform: "Mobile, Web" },
      { name: "Notion (Students)", icon: "📝", description: "Free workspace for students", descriptionTr: "Öğrenciler için ücretsiz çalışma alanı", downloadUrl: "https://www.notion.so/students", imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=200", rating: 4.7, platform: "PC, Mobile" },
      { name: "Wolfram Alpha", icon: "🔢", description: "Computational knowledge engine", descriptionTr: "Hesaplamalı bilgi motoru", downloadUrl: "https://www.wolframalpha.com/download", imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200", rating: 4.3, platform: "Mobile, Web" },
      { name: "Udemy", icon: "🎥", description: "Online learning marketplace", descriptionTr: "Çevrimiçi öğrenme pazaryeri", downloadUrl: "https://www.udemy.com/mobile/", imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=200", rating: 4.3, platform: "Mobile, Web" },
      { name: "Wikipedia", icon: "🌍", description: "Free encyclopedia at your fingertips", descriptionTr: "Parmaklarınızın ucundaki ücretsiz ansiklopedi", downloadUrl: "https://www.wikipedia.org", imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=200", rating: 4.6, platform: "Mobile, Web" },
    ],
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    nameTr: "Yaşam Tarzı",
    emoji: "🌟",
    apps: [
      { name: "Headspace", icon: "🧘", description: "Meditation and mindfulness app", descriptionTr: "Meditasyon ve farkındalık uygulaması", downloadUrl: "https://www.headspace.com/download", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200", rating: 4.6, platform: "Mobile" },
      { name: "MyFitnessPal", icon: "💪", description: "Calorie counter and diet tracker", descriptionTr: "Kalori sayacı ve diyet takipçisi", downloadUrl: "https://www.myfitnesspal.com/app", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200", rating: 4.4, platform: "Mobile" },
      { name: "Strava", icon: "🏃", description: "Activity tracker for runners and cyclists", descriptionTr: "Koşucular ve bisikletçiler için aktivite takipçisi", downloadUrl: "https://www.strava.com/mobile", imageUrl: "https://images.unsplash.com/photo-1461896836934-bd45ba8a6eb0?w=200", rating: 4.5, platform: "Mobile" },
      { name: "Calm", icon: "🌊", description: "Sleep and meditation app", descriptionTr: "Uyku ve meditasyon uygulaması", downloadUrl: "https://www.calm.com/app", imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=200", rating: 4.5, platform: "Mobile" },
      { name: "Nike Training Club", icon: "👟", description: "Free workouts and training plans", descriptionTr: "Ücretsiz antrenmanlar ve eğitim planları", downloadUrl: "https://www.nike.com/ntc-app", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200", rating: 4.4, platform: "Mobile" },
      { name: "Yummly", icon: "🍳", description: "Recipe discovery and meal planning", descriptionTr: "Tarif keşfi ve yemek planlama", downloadUrl: "https://www.yummly.com/mobile", imageUrl: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=200", rating: 4.3, platform: "Mobile" },
      { name: "Goodreads", icon: "📚", description: "Book discovery and reading tracker", descriptionTr: "Kitap keşfi ve okuma takipçisi", downloadUrl: "https://www.goodreads.com/app", imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200", rating: 4.2, platform: "Mobile" },
      { name: "Pinterest", icon: "📌", description: "Visual discovery and inspiration platform", descriptionTr: "Görsel keşif ve ilham platformu", downloadUrl: "https://www.pinterest.com/download/", imageUrl: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=200", rating: 4.4, platform: "Mobile, Web" },
      { name: "IFTTT", icon: "🔗", description: "Automate your apps and devices", descriptionTr: "Uygulamalarınızı ve cihazlarınızı otomatikleştirin", downloadUrl: "https://ifttt.com/download", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200", rating: 4.1, platform: "Mobile" },
      { name: "Sleep Cycle", icon: "😴", description: "Smart alarm clock and sleep tracker", descriptionTr: "Akıllı alarm saati ve uyku takipçisi", downloadUrl: "https://www.sleepcycle.com", imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200", rating: 4.5, platform: "Mobile" },
    ],
  },
  {
    slug: "marketing",
    name: "Marketing",
    nameTr: "Pazarlama",
    emoji: "📢",
    apps: [
      { name: "Mailchimp", icon: "🐵", description: "Email marketing and automation platform", descriptionTr: "E-posta pazarlama ve otomasyon platformu", downloadUrl: "https://mailchimp.com/download/", imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=200", rating: 4.3, platform: "Web, Mobile" },
      { name: "HubSpot", icon: "🟠", description: "CRM and marketing automation", descriptionTr: "CRM ve pazarlama otomasyonu", downloadUrl: "https://www.hubspot.com/products/get-started", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200", rating: 4.5, platform: "Web, Mobile" },
      { name: "Hootsuite", icon: "🦉", description: "Social media management platform", descriptionTr: "Sosyal medya yönetim platformu", downloadUrl: "https://www.hootsuite.com/plans", imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200", rating: 4.2, platform: "Web, Mobile" },
      { name: "Buffer", icon: "📅", description: "Social media scheduling and analytics", descriptionTr: "Sosyal medya zamanlama ve analitik", downloadUrl: "https://buffer.com/download", imageUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=200", rating: 4.3, platform: "Web, Mobile" },
      { name: "Google Analytics", icon: "📈", description: "Website traffic and user analytics", descriptionTr: "Web sitesi trafiği ve kullanıcı analitiği", downloadUrl: "https://analytics.google.com", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200", rating: 4.6, platform: "Web" },
      { name: "SEMrush", icon: "🔍", description: "SEO and digital marketing toolkit", descriptionTr: "SEO ve dijital pazarlama araç seti", downloadUrl: "https://www.semrush.com", imageUrl: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=200", rating: 4.4, platform: "Web" },
      { name: "Canva Pro", icon: "🎨", description: "Design tool for marketing materials", descriptionTr: "Pazarlama materyalleri için tasarım aracı", downloadUrl: "https://www.canva.com/pro/", imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=200", rating: 4.6, platform: "Web, Mobile" },
      { name: "Hotjar", icon: "🔥", description: "Heatmaps and user behavior analytics", descriptionTr: "Isı haritaları ve kullanıcı davranış analitiği", downloadUrl: "https://www.hotjar.com", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200", rating: 4.3, platform: "Web" },
      { name: "Ahrefs", icon: "🔗", description: "SEO toolset for backlinks and keywords", descriptionTr: "Backlink ve anahtar kelimeler için SEO araç seti", downloadUrl: "https://ahrefs.com", imageUrl: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=200", rating: 4.5, platform: "Web" },
      { name: "ActiveCampaign", icon: "📧", description: "Email marketing and CRM automation", descriptionTr: "E-posta pazarlama ve CRM otomasyonu", downloadUrl: "https://www.activecampaign.com", imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=200", rating: 4.4, platform: "Web, Mobile" },
    ],
  },
  {
    slug: "personalization",
    name: "Personalization",
    nameTr: "Kişiselleştirme",
    emoji: "🎨",
    apps: [
      { name: "Wallpaper Engine", icon: "🖼️", description: "Live wallpapers for your desktop", descriptionTr: "Masaüstünüz için canlı duvar kağıtları", downloadUrl: "https://store.steampowered.com/app/431960/Wallpaper_Engine/", imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=200", rating: 4.8, platform: "PC" },
      { name: "Rainmeter", icon: "🌧️", description: "Desktop customization tool for Windows", descriptionTr: "Windows için masaüstü özelleştirme aracı", downloadUrl: "https://www.rainmeter.net", imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=200", rating: 4.3, platform: "PC" },
      { name: "Nova Launcher", icon: "🚀", description: "Customizable Android home screen", descriptionTr: "Özelleştirilebilir Android ana ekranı", downloadUrl: "https://novalauncher.com", imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200", rating: 4.5, platform: "Android" },
      { name: "KWGT", icon: "🔧", description: "Custom widget maker for Android", descriptionTr: "Android için özel widget yapıcı", downloadUrl: "https://play.google.com/store/apps/details?id=org.kustom.widget", imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200", rating: 4.4, platform: "Android" },
      { name: "Lively Wallpaper", icon: "🌊", description: "Open-source live wallpaper for Windows", descriptionTr: "Windows için açık kaynak canlı duvar kağıdı", downloadUrl: "https://www.rocksdanister.com/lively/", imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=200", rating: 4.3, platform: "PC" },
      { name: "Widgetsmith", icon: "📱", description: "Custom widgets for iOS home screen", descriptionTr: "iOS ana ekranı için özel widget'lar", downloadUrl: "https://apps.apple.com/app/widgetsmith/id1523682319", imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200", rating: 4.2, platform: "iOS" },
      { name: "PowerToys", icon: "⚡", description: "Windows power user utilities by Microsoft", descriptionTr: "Microsoft'un Windows güç kullanıcı araçları", downloadUrl: "https://github.com/microsoft/PowerToys/releases", imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200", rating: 4.6, platform: "PC" },
      { name: "Alfred", icon: "🎩", description: "Productivity app and launcher for macOS", descriptionTr: "macOS için verimlilik uygulaması ve başlatıcı", downloadUrl: "https://www.alfredapp.com", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200", rating: 4.7, platform: "Mac" },
      { name: "Tasker", icon: "⚙️", description: "Android automation and customization", descriptionTr: "Android otomasyon ve özelleştirme", downloadUrl: "https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm", imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200", rating: 4.3, platform: "Android" },
      { name: "Shortcut (Siri)", icon: "🔄", description: "iOS automation with Siri Shortcuts", descriptionTr: "Siri Kısayolları ile iOS otomasyonu", downloadUrl: "https://apps.apple.com/app/shortcuts/id915249334", imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200", rating: 4.4, platform: "iOS" },
    ],
  },
  {
    slug: "social-communication",
    name: "Social & Communication",
    nameTr: "Sosyal ve İletişim",
    emoji: "💬",
    apps: [
      { name: "Discord", icon: "🟣", description: "Voice, video, and text communication", descriptionTr: "Ses, video ve metin iletişimi", downloadUrl: "https://discord.com/download", imageUrl: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "Telegram", icon: "✈️", description: "Fast and secure messaging app", descriptionTr: "Hızlı ve güvenli mesajlaşma uygulaması", downloadUrl: "https://telegram.org/apps", imageUrl: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=200", rating: 4.5, platform: "PC, Mobile" },
      { name: "WhatsApp", icon: "💚", description: "End-to-end encrypted messaging", descriptionTr: "Uçtan uca şifreli mesajlaşma", downloadUrl: "https://www.whatsapp.com/download", imageUrl: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=200", rating: 4.4, platform: "PC, Mobile" },
      { name: "Zoom", icon: "🔵", description: "Video conferencing and meetings", descriptionTr: "Video konferans ve toplantılar", downloadUrl: "https://zoom.us/download", imageUrl: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=200", rating: 4.3, platform: "PC, Mobile" },
      { name: "Microsoft Teams", icon: "🟦", description: "Team collaboration and video calls", descriptionTr: "Ekip iş birliği ve video görüşmeleri", downloadUrl: "https://www.microsoft.com/microsoft-teams/download-app", imageUrl: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=200", rating: 4.2, platform: "PC, Mobile" },
      { name: "Reddit", icon: "🟠", description: "Community forums and discussions", descriptionTr: "Topluluk forumları ve tartışmalar", downloadUrl: "https://www.reddit.com/mobile/download", imageUrl: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=200", rating: 4.3, platform: "Mobile, Web" },
      { name: "X (Twitter)", icon: "✖️", description: "Social media and real-time news", descriptionTr: "Sosyal medya ve gerçek zamanlı haberler", downloadUrl: "https://x.com/download", imageUrl: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=200", rating: 4.0, platform: "Mobile, Web" },
      { name: "Instagram", icon: "📸", description: "Photo and video sharing social network", descriptionTr: "Fotoğraf ve video paylaşım sosyal ağı", downloadUrl: "https://www.instagram.com/download/", imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200", rating: 4.4, platform: "Mobile" },
      { name: "TikTok", icon: "🎵", description: "Short-form video social platform", descriptionTr: "Kısa biçimli video sosyal platformu", downloadUrl: "https://www.tiktok.com/download", imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200", rating: 4.3, platform: "Mobile" },
      { name: "Snapchat", icon: "👻", description: "Photo messaging and stories", descriptionTr: "Fotoğraf mesajlaşma ve hikayeler", downloadUrl: "https://www.snapchat.com/download", imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200", rating: 4.1, platform: "Mobile" },
      { name: "LinkedIn", icon: "🔗", description: "Professional networking platform", descriptionTr: "Profesyonel ağ oluşturma platformu", downloadUrl: "https://www.linkedin.com/mobile/", imageUrl: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=200", rating: 4.2, platform: "Mobile, Web" },
    ],
  },
  {
    slug: "travel-navigation",
    name: "Travel & Navigation",
    nameTr: "Seyahat ve Navigasyon",
    emoji: "🗺️",
    apps: [
      { name: "Google Maps", icon: "📍", description: "Navigation and local business discovery", descriptionTr: "Navigasyon ve yerel işletme keşfi", downloadUrl: "https://maps.google.com/", imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=200", rating: 4.7, platform: "Mobile, Web" },
      { name: "Waze", icon: "🚗", description: "Community-driven GPS navigation", descriptionTr: "Topluluk odaklı GPS navigasyonu", downloadUrl: "https://www.waze.com/apps", imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200", rating: 4.5, platform: "Mobile" },
      { name: "Airbnb", icon: "🏠", description: "Vacation rentals and unique stays", descriptionTr: "Tatil kiralama ve benzersiz konaklama", downloadUrl: "https://www.airbnb.com/mobile", imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200", rating: 4.4, platform: "Mobile, Web" },
      { name: "Booking.com", icon: "🏨", description: "Hotel and accommodation booking", descriptionTr: "Otel ve konaklama rezervasyonu", downloadUrl: "https://www.booking.com/apps.html", imageUrl: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=200", rating: 4.3, platform: "Mobile, Web" },
      { name: "Uber", icon: "🚕", description: "Ride-hailing and delivery service", descriptionTr: "Araç çağırma ve teslimat hizmeti", downloadUrl: "https://www.uber.com/app", imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200", rating: 4.2, platform: "Mobile" },
      { name: "Skyscanner", icon: "✈️", description: "Flight and hotel price comparison", descriptionTr: "Uçuş ve otel fiyat karşılaştırması", downloadUrl: "https://www.skyscanner.com/mobile", imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=200", rating: 4.4, platform: "Mobile, Web" },
      { name: "TripAdvisor", icon: "🗺️", description: "Travel reviews and recommendations", descriptionTr: "Seyahat değerlendirmeleri ve önerileri", downloadUrl: "https://www.tripadvisor.com/apps", imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200", rating: 4.3, platform: "Mobile, Web" },
      { name: "Google Earth", icon: "🌎", description: "Explore the world in 3D satellite imagery", descriptionTr: "Dünyayı 3D uydu görüntüleriyle keşfedin", downloadUrl: "https://www.google.com/earth/download/", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200", rating: 4.6, platform: "PC, Mobile" },
      { name: "Rome2Rio", icon: "🧭", description: "Multi-modal travel planning", descriptionTr: "Çok modlu seyahat planlaması", downloadUrl: "https://www.rome2rio.com/apps", imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200", rating: 4.2, platform: "Mobile, Web" },
      { name: "Citymapper", icon: "🚇", description: "Urban transit and navigation", descriptionTr: "Şehir içi ulaşım ve navigasyon", downloadUrl: "https://citymapper.com/apps", imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200", rating: 4.4, platform: "Mobile" },
    ],
  },
  {
    slug: "assistant",
    name: "Assistant",
    nameTr: "Asistan",
    emoji: "🤖",
    apps: [
      { name: "ChatGPT", icon: "🤖", description: "AI assistant by OpenAI for conversations", descriptionTr: "Konuşmalar için OpenAI'ın AI asistanı", downloadUrl: "https://chat.openai.com", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.8, platform: "Web, Mobile" },
      { name: "Google Gemini", icon: "✨", description: "Google's AI assistant and chatbot", descriptionTr: "Google'ın AI asistanı ve sohbet botu", downloadUrl: "https://gemini.google.com", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.5, platform: "Web, Mobile" },
      { name: "Claude", icon: "🟤", description: "AI assistant by Anthropic", descriptionTr: "Anthropic'in AI asistanı", downloadUrl: "https://claude.ai", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.6, platform: "Web, Mobile" },
      { name: "Perplexity", icon: "🔮", description: "AI-powered search and answer engine", descriptionTr: "AI destekli arama ve cevap motoru", downloadUrl: "https://www.perplexity.ai", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.5, platform: "Web, Mobile" },
      { name: "Copilot (Microsoft)", icon: "🟦", description: "AI assistant integrated with Microsoft 365", descriptionTr: "Microsoft 365 ile entegre AI asistanı", downloadUrl: "https://copilot.microsoft.com", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.3, platform: "Web, Mobile" },
      { name: "Siri", icon: "🍎", description: "Apple's built-in voice assistant", descriptionTr: "Apple'ın yerleşik sesli asistanı", downloadUrl: "https://www.apple.com/siri/", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.0, platform: "Apple devices" },
      { name: "Alexa", icon: "🔵", description: "Amazon's voice assistant", descriptionTr: "Amazon'un sesli asistanı", downloadUrl: "https://www.amazon.com/gp/help/customer/display.html?nodeId=201602060", imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=200", rating: 4.2, platform: "Mobile, Echo" },
      { name: "Google Assistant", icon: "🟡", description: "Google's AI-powered voice assistant", descriptionTr: "Google'ın AI destekli sesli asistanı", downloadUrl: "https://assistant.google.com", imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=200", rating: 4.3, platform: "Mobile" },
      { name: "Jasper AI", icon: "📝", description: "AI content creation assistant", descriptionTr: "AI içerik oluşturma asistanı", downloadUrl: "https://www.jasper.ai", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.2, platform: "Web" },
      { name: "Otter.ai", icon: "🦦", description: "AI meeting transcription assistant", descriptionTr: "AI toplantı transkripsiyon asistanı", downloadUrl: "https://otter.ai/download", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.4, platform: "Web, Mobile" },
      { name: "Replika", icon: "💜", description: "AI companion and chatbot friend", descriptionTr: "AI arkadaş ve sohbet botu", downloadUrl: "https://replika.com", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.1, platform: "Mobile" },
      { name: "Character.AI", icon: "🎭", description: "Chat with AI-powered characters", descriptionTr: "AI destekli karakterlerle sohbet edin", downloadUrl: "https://character.ai", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200", rating: 4.3, platform: "Web, Mobile" },
    ],
  },
];

export const getCategoryBySlug = (slug: string): AppCategory | undefined =>
  appCategories.find((c) => c.slug === slug);

export const getAppSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const findCategoryApp = (categorySlug: string, appSlug: string) => {
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) return { category: undefined, app: undefined };
  const app = cat.apps.find((a) => getAppSlug(a.name) === appSlug);
  return { category: cat, app };
};
