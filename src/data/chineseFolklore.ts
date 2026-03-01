export interface FolkloreStory {
  id: string;
  title: string;
  titleZh: string;
  summary: string;
  summaryZh: string;
  content: string;
  contentZh: string;
  category: string;
  imageUrl: string;
  readTime: number;
}

export const chineseFolkloreStories: FolkloreStory[] = [
  {
    id: "chang-e-moon",
    title: "Chang'e Flies to the Moon",
    titleZh: "嫦娥奔月",
    summary: "The legendary tale of the Moon Goddess who drank the elixir of immortality and ascended to the moon, where she lives to this day.",
    summaryZh: "嫦娥偷吃了后羿的仙丹，飞升到月宫，从此与玉兔相伴，成为月亮女神的传奇故事。",
    content: `Long ago, ten suns scorched the earth, burning crops and drying rivers. The mighty archer Hou Yi shot down nine suns with his divine bow, saving all life on earth. As a reward, the Queen Mother of the West gave him an elixir of immortality.

Hou Yi did not wish to become immortal without his beloved wife Chang'e, so he asked her to keep the elixir safe. But one of his apprentices, Pang Meng, learned of the elixir and tried to steal it while Hou Yi was away hunting.

Rather than let the elixir fall into wicked hands, Chang'e swallowed it herself. She began to float upward, higher and higher, until she reached the moon. There she built a palace of cold jade, accompanied only by a jade rabbit who pounds medicine in a mortar.

Hou Yi was heartbroken. Each year on the fifteenth day of the eighth lunar month, when the moon is fullest and brightest, he would set out fruits and cakes that Chang'e loved, gazing up at her silhouette. The people followed his example, and so began the Mid-Autumn Festival — a celebration of reunion, love, and the eternal light of the moon.`,
    contentZh: `很久以前，天上有十个太阳同时出现，烤焦了庄稼，晒干了河流。神射手后羿用神弓射下了九个太阳，拯救了天下苍生。西王母因此赐他一颗长生不老仙丹。

后羿不愿独自成仙，便将仙丹交给妻子嫦娥保管。然而他的徒弟蓬蒙得知此事，趁后羿外出打猎时闯入家中企图抢夺仙丹。

嫦娥为了不让仙丹落入坏人之手，情急之下吞下了仙丹。她的身体开始飘浮，越飞越高，最终到达了月亮。她在那里建造了一座冰冷的玉宫，只有一只玉兔陪伴她捣药。

后羿悲痛欲绝。每年农历八月十五月亮最圆最亮的时候，他都会摆出嫦娥爱吃的水果和糕点，仰望月亮上她的身影。百姓们纷纷效仿，中秋节由此诞生——这是一个关于团圆、爱情和月光永恒的节日。`,
    category: "mythology",
    imageUrl: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800",
    readTime: 4,
  },
  {
    id: "monkey-king",
    title: "The Monkey King: Sun Wukong",
    titleZh: "美猴王：孙悟空",
    summary: "Born from a magical stone, the Monkey King defied heaven, mastered 72 transformations, and journeyed west to seek Buddhist scriptures.",
    summaryZh: "从仙石中诞生的美猴王，大闹天宫，修得七十二变，后保护唐僧西天取经的传奇故事。",
    content: `On the Mountain of Flowers and Fruit, a magical stone that had absorbed the essence of heaven and earth for thousands of years suddenly cracked open. From within leapt a stone monkey, whose eyes shot golden beams that startled the Jade Emperor himself.

The monkey became king of his troop and called himself the Handsome Monkey King. Seeking immortality, he traveled across oceans to study under the Patriarch Subhuti, who gave him the name Sun Wukong — "Monkey Awakened to Emptiness." He learned the 72 transformations, cloud-somersaulting across 108,000 li in a single leap, and gained immense power.

Sun Wukong stormed the Dragon King's palace for a weapon and claimed the Ruyi Jingu Bang — an iron pillar that could shrink to a needle or grow to touch the sky. He erased his name from the Book of Life and Death, ate the Peaches of Immortality, and consumed Laozi's pills of longevity.

When the Jade Emperor sent heavenly armies against him, none could defeat him. Finally, the Buddha himself intervened, trapping Wukong beneath Five Elements Mountain for 500 years. He was freed only when the monk Tang Sanzang passed by on his journey west. Wukong became his protector, and together with Zhu Bajie and Sha Wujing, they faced 81 trials before reaching India to obtain the sacred scriptures.`,
    contentZh: `在花果山上，一块吸收了千年天地精华的仙石突然裂开。一只石猴从中跃出，双眼射出金光，惊动了天上的玉皇大帝。

石猴成为猴群之王，自称"美猴王"。为了追求长生不老，他漂洋过海拜菩提祖师为师，得名"孙悟空"——意为"悟到空性的猴子"。他学会了七十二变、筋斗云一翻十万八千里，修得了强大的法力。

孙悟空闯入龙宫夺得兵器——如意金箍棒，这根铁柱可大可小、可伸可缩。他还从生死簿上勾去了自己的名字，偷吃了蟠桃，吞服了太上老君的仙丹。

玉帝派出天兵天将征讨他，却无人能敌。最终佛祖亲自出手，将悟空压在五行山下五百年。直到唐僧路过此地，悟空才得以脱身。他成为唐僧的护法，与猪八戒、沙悟净一同经历了九九八十一难，最终到达天竺取得真经。`,
    category: "epic",
    imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800",
    readTime: 5,
  },
  {
    id: "cowherd-weaver",
    title: "The Cowherd and the Weaver Girl",
    titleZh: "牛郎织女",
    summary: "A love story between a mortal cowherd and a celestial weaver, separated by the Milky Way and reunited once a year on a bridge of magpies.",
    summaryZh: "牛郎与织女的爱情故事，被银河分隔两岸，每年七夕在鹊桥上相会一次。",
    content: `Niulang was a poor orphan boy who lived with his elder brother and cruel sister-in-law. When they cast him out, his only companion was an old ox. One day the ox spoke: "Go to the lake at dusk. Heavenly maidens will bathe there. Take the red robe, and its owner will become your wife."

Niulang did as told and met Zhinü, the Weaver Girl — seventh daughter of the Jade Emperor and the most skilled weaver in heaven, who spun the clouds and painted the rainbow. They fell deeply in love, married, and had two children, living a simple but happy life.

When the Queen Mother of Heaven discovered that Zhinü had married a mortal, she was furious. She dragged Zhinü back to heaven. The old ox, dying, told Niulang to wrap himself in its hide to fly to heaven. Niulang placed their children in baskets on a carrying pole and chased after his wife.

Just as he was about to reach her, the Queen Mother scratched a river across the sky with her golden hairpin — the Silver River, which mortals call the Milky Way. The lovers wept on opposite banks, their tears moving even the cold-hearted Queen. She allowed them to meet once a year, on the seventh night of the seventh month, when magpies form a bridge across the stars.

To this day, it is said that if you stand under a grapevine on Qixi, you can hear the lovers whispering their year's worth of longing.`,
    contentZh: `牛郎是个可怜的孤儿，与哥哥嫂嫂同住。嫂嫂心狠，将他赶出家门，只有一头老牛与他相依为命。一天老牛开口说话："黄昏时去湖边，天上的仙女会在那里沐浴。拿走那件红衣裳，它的主人就会成为你的妻子。"

牛郎照做了，遇到了织女——玉帝的第七个女儿，也是天上最巧的织女，她编织云彩、描绘彩虹。两人深深相爱，结为夫妻，生了一双儿女，过着简朴却幸福的生活。

王母娘娘发现织女嫁给了凡人，大发雷霆，将织女抓回天庭。老牛临死前告诉牛郎，披上它的皮就能飞上天。牛郎将两个孩子放在筐里，挑着担子追赶妻子。

眼看就要追上，王母娘娘用金簪在天空划出一道大河——银河，凡人称之为天河。夫妻二人隔河相望，泪如雨下，连铁石心肠的王母也被感动了。她允许他们每年农历七月初七相会一次，届时喜鹊会飞来搭成一座桥。

据说，每年七夕之夜，如果你站在葡萄架下，就能听到牛郎织女在倾诉一年的思念。`,
    category: "romance",
    imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800",
    readTime: 5,
  },
  {
    id: "white-snake",
    title: "Legend of the White Snake",
    titleZh: "白蛇传",
    summary: "A thousand-year-old white snake spirit transforms into a beautiful woman and falls in love with a mortal scholar by the West Lake.",
    summaryZh: "千年白蛇精化为美丽女子，在西湖边与书生许仙相恋的凄美传说。",
    content: `For a thousand years, a white snake cultivated her spiritual powers in the mountains, absorbing the essence of moonlight and rain. With her companion, a green snake named Xiao Qing, she finally achieved human form and descended to the mortal world.

On a rainy day by the West Lake in Hangzhou, the White Snake — now calling herself Bai Suzhen — met a young scholar named Xu Xian. He lent her his umbrella, and from that gentle act, love blossomed. They married and opened an herbal medicine shop, healing the sick and earning the admiration of the townspeople.

But the monk Fa Hai, abbot of Jinshan Temple, sensed Bai Suzhen's true nature. He told Xu Xian to make his wife drink realgar wine during the Dragon Boat Festival. When she did, her snake form was briefly revealed, and Xu Xian fainted from shock.

To save her husband, Bai Suzhen braved the dangers of Kunlun Mountain to steal the magical lingzhi mushroom. She even flooded Jinshan Temple in an epic battle with Fa Hai. But in the end, weakened from pregnancy, she was captured and imprisoned beneath the Leifeng Pagoda.

Years later, her son Xu Shilin passed the imperial examinations and came to pray at the pagoda. His filial piety moved heaven, and the pagoda crumbled, freeing Bai Suzhen. The family was reunited at last, and even Fa Hai realized that true love transcends the boundary between human and spirit.`,
    contentZh: `一条白蛇在山中修炼千年，吸收日月精华，终于修成人形。她与同伴青蛇小青一同下凡来到人间。

一个雨天，白蛇化名白素贞，在杭州西湖边遇到了书生许仙。许仙将雨伞借给了她，一段美丽的爱情就此展开。他们结为夫妻，开了一间药铺，治病救人，深得百姓敬重。

然而金山寺的法海和尚察觉了白素贞的真身。他让许仙在端午节给妻子喝雄黄酒。白素贞饮酒后短暂现出蛇形，许仙惊吓过度晕倒了。

为了救丈夫，白素贞不顾危险上昆仑山盗取灵芝仙草，还水漫金山寺与法海大战。但最终，怀有身孕的她力竭被擒，被镇压在雷峰塔下。

多年后，她的儿子许士林高中状元，来到塔前跪拜。他的孝心感动了上天，雷峰塔轰然倒塌，白素贞重获自由。一家人终于团聚，就连法海也终于明白——真爱可以超越人与妖的界限。`,
    category: "romance",
    imageUrl: "https://images.unsplash.com/photo-1474524955719-b9f95db7d544?w=800",
    readTime: 5,
  },
  {
    id: "ne-zha",
    title: "Ne Zha Conquers the Dragon King",
    titleZh: "哪吒闹海",
    summary: "The rebellious child god Ne Zha battles the Dragon King of the Eastern Sea to protect his people, sacrificing himself and being reborn from a lotus flower.",
    summaryZh: "叛逆的少年神哪吒大闹东海，与龙王对抗，舍身救民，最终在莲花中重生的故事。",
    content: `Lady Yin was pregnant for three years and six months before giving birth to a ball of flesh. Her husband, General Li Jing, slashed it open with his sword, and out tumbled a boy wearing a golden bracelet and a red silk sash — gifts from the immortal Taiyi Zhenren, who named the child Ne Zha.

Ne Zha grew supernaturally fast. At seven years old, during a drought, he went to the Eastern Sea to bathe. His splashing, amplified by the Cosmic Ring, shook the Dragon King's underwater palace. The Dragon King sent his son Ao Bing to investigate. A fight broke out, and Ne Zha, with his Fire-Tipped Spear, killed Ao Bing and drew out his dragon tendons to make a belt for his father.

The Dragon King, Ao Guang, was enraged and threatened to flood the city. Ne Zha's father, fearing divine punishment, tried to punish his son. Rather than bring disaster upon his family and people, Ne Zha carved his own flesh and returned it to his mother, his bones to his father — freeing them from responsibility.

Moved by his sacrifice, his master Taiyi Zhenren used lotus flowers to reconstruct Ne Zha's body. Reborn from the lotus, Ne Zha was more powerful than ever. He rode on Wind Fire Wheels, wielded the Universe Ring, and carried the Fire-Tipped Spear. He went on to become one of heaven's greatest warriors, helping defeat the tyrant King Zhou and establish the Zhou dynasty.`,
    contentZh: `殷夫人怀胎三年零六个月，生下一个肉球。父亲李靖将军挥剑劈开，一个戴着金镯、围着红绫的男孩跳了出来——这些法宝是太乙真人所赐，并为他取名哪吒。

哪吒成长神速。七岁那年，天旱无雨，他到东海边洗澡。乾坤圈搅动海水，震动了龙宫。龙王派三太子敖丙前来查看，两人打斗起来。哪吒用火尖枪打死了敖丙，还抽了龙筋给父亲做腰带。

龙王敖广暴怒，威胁要水淹陈塘关。李靖害怕连累全城百姓，要惩罚哪吒。哪吒不愿牵连家人和百姓，便削肉还母、剔骨还父——以自身性命承担一切。

太乙真人被他的牺牲精神感动，用莲花重塑了哪吒的身体。莲花重生的哪吒法力更加强大。他脚踏风火轮、手持乾坤圈和火尖枪，后来成为天庭最勇猛的战神之一，助力武王伐纣，建立了周朝。`,
    category: "mythology",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
    readTime: 5,
  },
  {
    id: "mulan",
    title: "The Ballad of Hua Mulan",
    titleZh: "花木兰从军",
    summary: "A young woman disguises herself as a man to take her aging father's place in the army, serving with distinction for twelve years.",
    summaryZh: "花木兰女扮男装替年迈的父亲从军，征战十二年屡立战功的巾帼英雄故事。",
    content: `By the door, the sound of Mulan's loom fell silent. Instead of the shuttle's click, only sighs could be heard. Her father's name was on the conscription list, but he was old and frail, and Mulan had no elder brother to take his place.

That night, Mulan made her decision. She went to the east market for a horse, the west market for a saddle, the south market for a bridle, and the north market for a long whip. She cut her hair, dressed in her father's armor, and rode north to war.

For twelve years, Mulan fought alongside her comrades. She crossed frozen rivers and slept on battlefields. She earned merit through thirty-six battles and was offered a position of great authority by the Khan himself. But Mulan refused titles and rewards. She asked only for a swift camel to carry her home.

When she arrived, her parents wept with joy at the gate. Her sister adorned herself, and her brother prepared a feast. Mulan entered her old room, took off her armor, put on her old dress, and arranged her hair by the window.

When she came out to greet her comrades who had traveled with her, they were stunned. For twelve years they had marched beside her, shared tents and meals, and never once suspected that Mulan was a woman. "The male hare hops and leaps," Mulan laughed, "the female hare has misty eyes. But when two hares run side by side, who can tell if I am he or she?"`,
    contentZh: `门前传来的不再是织布机的声音，只听到木兰一声声叹息。父亲的名字出现在征兵名册上，但父亲年老体弱，木兰又没有兄长可以代替。

那天晚上，木兰做出了决定。她东市买骏马，西市买鞍鞯，南市买辔头，北市买长鞭。她剪断长发，穿上父亲的铠甲，策马北上奔赴战场。

十二年间，木兰与战友们并肩作战。她渡过冰封的河流，睡在沙场之上。她历经三十六战，屡建奇功，可汗亲自封赏她高官厚禄。但木兰辞谢了一切封赏，只求一匹千里驼送她回乡。

到家时，父母在门口喜极而泣。妹妹精心打扮，弟弟杀猪宰羊准备宴席。木兰回到自己的闺房，脱下战甲，换上旧时的裙装，对着窗户梳理云鬓。

当她出来迎接同行的战友们时，所有人都惊呆了。十二年来，他们同吃同住、并肩作战，竟从未发觉木兰是女儿身。木兰笑道："雄兔脚扑朔，雌兔眼迷离。双兔傍地走，安能辨我是雄雌？"`,
    category: "legend",
    imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800",
    readTime: 5,
  },
  {
    id: "four-dragons",
    title: "The Four Dragons",
    titleZh: "四龙的传说",
    summary: "Four dragons defy the Jade Emperor to bring rain to the drought-stricken people, sacrificing themselves to become China's four great rivers.",
    summaryZh: "四条龙不顾玉帝禁令，为旱灾中的百姓降雨，最终化身为中国四大河流的感人传说。",
    content: `Long ago, there were no rivers on earth — only the Eastern Sea, where four mighty dragons lived: the Long Dragon, the Yellow Dragon, the Black Dragon, and the Pearl Dragon.

One day, they flew over the land and saw the people suffering terribly. Fields were cracked, crops had withered, and children cried from hunger. The dragons were moved with compassion and flew up to the Jade Emperor's palace to beg for rain.

The Jade Emperor, busy with his pleasures, waved them away. "I will send rain in ten days," he said. But ten days passed, and no rain came. The people were dying.

The four dragons could wait no longer. They scooped up water from the Eastern Sea in their massive jaws and sprayed it across the land as rain. The people danced and sang, the crops revived, and life returned to the fields.

But the Jade Emperor was furious. He ordered the Mountain God to trap each dragon beneath a mountain forever. The four dragons did not regret their choice. As they lay imprisoned, their bodies transformed. They became four great rivers, flowing eternally across the land of China to nourish its people: the Long Dragon became the Yangtze, the Yellow Dragon became the Yellow River, the Black Dragon became the Heilongjiang, and the Pearl Dragon became the Pearl River.

To this day, these four rivers carry the dragons' compassion from the mountains to the sea, giving life to hundreds of millions.`,
    contentZh: `很久以前，大地上没有河流——只有东海，四条巨龙居住在那里：长龙、黄龙、黑龙和珠龙。

一天，它们飞越大地，看到百姓正在遭受可怕的旱灾。田地龟裂，庄稼枯萎，孩子们饿得直哭。四条龙心生怜悯，飞上天宫恳求玉帝降雨。

玉帝正忙于享乐，漫不经心地说："十天之内我会降雨。"但十天过去了，一滴雨也没有。百姓奄奄一息。

四条龙再也等不下去了。它们用巨大的龙口从东海衔起海水，喷洒向大地化为甘霖。百姓欢呼雀跃，庄稼复苏，大地重新焕发生机。

但玉帝勃然大怒，下令山神将四条龙永远镇压在大山之下。四条龙毫不后悔。在山下，它们的身体化作了四条大河，永远流淌在中华大地上滋养百姓：长龙化为长江，黄龙化为黄河，黑龙化为黑龙江，珠龙化为珠江。

至今，这四条大河承载着龙的慈悲，从高山流向大海，哺育着亿万生灵。`,
    category: "mythology",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    readTime: 4,
  },
  {
    id: "yu-gong-mountain",
    title: "The Foolish Old Man Who Moved Mountains",
    titleZh: "愚公移山",
    summary: "A 90-year-old man vows to move two massive mountains blocking his village path, and his unwavering determination moves the gods to help.",
    summaryZh: "九十岁的愚公立志移走挡在家门前的两座大山，他坚定不移的决心最终感动了天神。",
    content: `Yu Gong was nearly ninety years old. Before his house stood two enormous mountains — Taihang and Wangwu — blocking the path to the outside world. Every journey required a long detour around them.

One day, Yu Gong gathered his family. "Let us dig away these mountains," he said, "so that the road will be straight and clear for generations to come." His wife laughed. "You're too old. Where would you even put the dirt?" Yu Gong replied, "We'll dump it in the Bohai Sea."

And so Yu Gong, his sons, and his grandsons began digging. Day after day, season after season, they chipped away at the stone. A wise old man named Zhi Sou came to mock him. "You are foolish! You will die before you move even a corner of these mountains."

Yu Gong set down his hoe and looked at Zhi Sou calmly. "When I die, my sons will dig. When they die, my grandsons will dig. My grandsons will have sons, and those sons will have sons. The mountains will not grow, but my family will never end. Why can't we move them?"

Zhi Sou had no answer.

The God of the Mountains heard of Yu Gong's determination and began to tremble — what if the old man actually succeeded? He reported to the Jade Emperor, who was so moved by Yu Gong's spirit that he sent two divine giants to carry the mountains away, one to the south and one to the north.

From then on, the road before Yu Gong's house was flat and clear. And the lesson endured: no task is too great for those with unwavering determination.`,
    contentZh: `愚公快九十岁了。他家门前矗立着两座巨大的山——太行山和王屋山——挡住了通往外面世界的路。每次出行都要绕很远的路。

一天，愚公召集家人说："我们把这两座山挖掉吧，这样子孙后代就能走直路了。"妻子笑道："你这么老了，挖出来的土往哪放？"愚公说："倒进渤海去。"

于是愚公带着儿孙们开始挖山。日复一日，年复一年，他们一点一点地凿着石头。一个叫智叟的老头来嘲笑他："你太傻了！你死了也挖不动这山的一个角。"

愚公放下锄头，平静地看着智叟说："我死了有儿子，儿子死了有孙子，孙子又会有儿子，儿子又会有孙子。子子孙孙无穷匮也，而山不加增，何愁挖不平？"

智叟无言以对。

山神听到了愚公的决心，开始害怕——万一这个老头真的成功了呢？他把此事报告了玉帝。玉帝被愚公的精神所感动，派了两位大力神将两座山搬走，一座放在南方，一座放在北方。

从此，愚公家门前一马平川。这个故事流传至今，告诉人们：只要有坚定不移的决心，没有完不成的事业。`,
    category: "fable",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    readTime: 4,
  },
];

export const folkloreCategories = [
  { id: "all", label: "All Stories", labelZh: "全部故事" },
  { id: "mythology", label: "Mythology", labelZh: "神话" },
  { id: "romance", label: "Romance", labelZh: "爱情" },
  { id: "epic", label: "Epic", labelZh: "史诗" },
  { id: "legend", label: "Legend", labelZh: "传说" },
  { id: "fable", label: "Fable", labelZh: "寓言" },
];
