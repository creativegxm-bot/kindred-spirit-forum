import { Sparkles, FileText } from "lucide-react";

const samples: { label: string; tag: "AI" | "Human"; text: string }[] = [
  {
    label: "ChatGPT essay intro",
    tag: "AI",
    text:
      "In today's rapidly evolving digital landscape, artificial intelligence has emerged as a transformative force that is fundamentally reshaping the way we interact with technology. It is important to note that, while there are numerous benefits associated with this paradigm shift, there are also significant challenges that must be carefully considered. This essay will explore both the opportunities and the obstacles, ultimately demonstrating that a balanced approach is essential.",
  },
  {
    label: "Reddit comment",
    tag: "Human",
    text:
      "honestly i tried it for like a week and it was fine? the battery is whatever, dies by 6pm most days but i charge in the car so idc. one thing tho — the speaker is way louder than my old one which my downstairs neighbor has Opinions about lol. would i buy again, probably yeah",
  },
  {
    label: "Claude product blurb",
    tag: "AI",
    text:
      "Our innovative platform empowers users to seamlessly streamline their workflows while leveraging cutting-edge technology. By combining intuitive design with robust functionality, we deliver a comprehensive solution that meets the diverse needs of modern professionals. Whether you're a small business owner or part of an enterprise team, our tools are designed to help you achieve more.",
  },
];

type Props = {
  onPick: (text: string) => void;
};

const SampleTexts = ({ onPick }: Props) => (
  <div className="mt-3">
    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
      <Sparkles className="size-3 text-primary" />
      Try a sample:
    </div>
    <div className="flex flex-wrap gap-2">
      {samples.map((s) => (
        <button
          key={s.label}
          onClick={() => onPick(s.text)}
          className="group flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-border bg-secondary/40 hover:border-primary/40 hover:bg-secondary transition-colors"
        >
          <FileText className="size-3 text-muted-foreground" />
          <span>{s.label}</span>
          <span
            className={
              "text-[9px] font-bold px-1.5 py-0.5 rounded-sm " +
              (s.tag === "AI"
                ? "bg-red-500/15 text-red-400"
                : "bg-emerald-500/15 text-emerald-400")
            }
          >
            {s.tag}
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default SampleTexts;
