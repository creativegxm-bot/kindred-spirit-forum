import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { iqQuestions, estimateIQ, iqTestTranslations } from "@/data/iqTestQuestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TestState = "intro" | "testing" | "results";

const IQTest = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = iqTestTranslations[language] || iqTestTranslations.en;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [testState, setTestState] = useState<TestState>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(iqQuestions.length).fill(null));
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [saved, setSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (testState === "testing") {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testState, startTime]);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("iq_test_results")
      .select("*")
      .order("iq_estimate", { ascending: false })
      .limit(10);
    if (data) setLeaderboard(data);
  };

  const startTest = () => {
    setAnswers(new Array(iqQuestions.length).fill(null));
    setCurrentQuestion(0);
    setStartTime(Date.now());
    setElapsed(0);
    setSaved(false);
    setTestState("testing");
  };

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const finishTest = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const end = Date.now();
    setEndTime(end);
    setTestState("results");

    const score = iqQuestions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0);
    const iq = estimateIQ(score, iqQuestions.length);
    const timeSec = Math.floor((end - startTime) / 1000);

    if (user) {
      const { error } = await supabase.from("iq_test_results").insert({
        user_id: user.id,
        score,
        total_questions: iqQuestions.length,
        iq_estimate: iq,
        time_taken_seconds: timeSec,
        language_code: language,
      });
      if (!error) {
        setSaved(true);
        toast.success(t.scoreSaved);
        fetchLeaderboard();
      }
    }
  };

  const score = iqQuestions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0);
  const iq = estimateIQ(score, iqQuestions.length);
  const timeSec = testState === "results" ? Math.floor((endTime - startTime) / 1000) : elapsed;
  const minutes = Math.floor(timeSec / 60);
  const seconds = timeSec % 60;

  const getIQLabel = (iq: number) => {
    if (iq >= 130) return t.genius;
    if (iq >= 115) return t.veryHigh;
    if (iq >= 100) return t.aboveAverage;
    if (iq >= 85) return t.average;
    return t.belowAverage;
  };

  const getIQColor = (iq: number) => {
    if (iq >= 130) return "text-yellow-500";
    if (iq >= 115) return "text-green-500";
    if (iq >= 100) return "text-blue-500";
    if (iq >= 85) return "text-orange-500";
    return "text-red-500";
  };

  const question = iqQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / iqQuestions.length) * 100;

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenAuth={handleOpenAuth} onCreatePost={() => {}} onMenuToggle={() => {}} />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* INTRO */}
        {testState === "intro" && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
              <p className="text-muted-foreground text-lg">{t.subtitle}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { label: t.easy, count: 7, color: "bg-green-500/10 text-green-600" },
                { label: t.medium, count: 7, color: "bg-yellow-500/10 text-yellow-600" },
                { label: t.hard, count: 6, color: "bg-red-500/10 text-red-600" },
              ].map((d) => (
                <Card key={d.label} className="p-4 text-center">
                  <div className={cn("text-sm font-medium rounded-full px-2 py-1 inline-block", d.color)}>
                    {d.label}
                  </div>
                  <div className="text-2xl font-bold mt-2 text-foreground">{d.count}</div>
                </Card>
              ))}
            </div>

            <Button size="lg" onClick={startTest} className="gap-2">
              <Brain className="h-5 w-5" />
              {t.startTest}
            </Button>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <Card className="p-6 text-left mt-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {t.leaderboard}
                </h2>
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                        <span className={cn("font-semibold", getIQColor(entry.iq_estimate))}>
                          IQ {entry.iq_estimate}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {entry.score}/{entry.total_questions}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TESTING */}
        {testState === "testing" && question && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t.question} {currentQuestion + 1} {t.of} {iqQuestions.length}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
            </div>

            <Progress value={progress} className="h-2" />

            <Card className="p-8">
              <div className="space-y-2 mb-2">
                <Badge variant={question.difficulty === "easy" ? "secondary" : question.difficulty === "medium" ? "outline" : "destructive"}>
                  {t[question.difficulty]}
                </Badge>
              </div>

              <h2 className="text-lg font-semibold mb-6 text-foreground">{t.whatComesNext}</h2>

              {/* Pattern display */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8 p-6 rounded-xl bg-muted/50 min-h-[80px]">
                {question.pattern.map((item, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-2xl md:text-3xl transition-all",
                      item === "?" && "text-primary font-bold animate-pulse text-4xl"
                    )}
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-2xl text-center transition-all hover:scale-[1.02]",
                      answers[currentQuestion] === i
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.previous}
              </Button>

              {currentQuestion < iqQuestions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion((p) => p + 1)}
                  disabled={answers[currentQuestion] === null}
                  className="gap-2"
                >
                  {t.next}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={finishTest}
                  disabled={answers.some((a) => a === null)}
                  className="gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  {t.finish}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {testState === "results" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-foreground">{t.results}</h1>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <Card className="p-4 text-center">
                  <CheckCircle2 className="h-6 w-6 mx-auto text-green-500 mb-1" />
                  <div className="text-2xl font-bold text-foreground">{score}/{iqQuestions.length}</div>
                  <div className="text-xs text-muted-foreground">{t.score}</div>
                </Card>
                <Card className="p-4 text-center">
                  <Brain className={cn("h-6 w-6 mx-auto mb-1", getIQColor(iq))} />
                  <div className={cn("text-2xl font-bold", getIQColor(iq))}>{iq}</div>
                  <div className="text-xs text-muted-foreground">{t.iqEstimate}</div>
                </Card>
                <Card className="p-4 text-center">
                  <Clock className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <div className="text-2xl font-bold text-foreground">{minutes}:{seconds.toString().padStart(2, "0")}</div>
                  <div className="text-xs text-muted-foreground">{t.timeTaken}</div>
                </Card>
              </div>

              <Badge className={cn("text-lg px-4 py-2", getIQColor(iq))}>
                {getIQLabel(iq)}
              </Badge>

              {!user && (
                <p className="text-sm text-muted-foreground">{t.loginToSave}</p>
              )}
              {saved && (
                <p className="text-sm text-green-500 font-medium">{t.scoreSaved}</p>
              )}
            </div>

            {/* Review answers */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">{t.score}: {score}/{iqQuestions.length}</h2>
              <div className="space-y-4">
                {iqQuestions.map((q, i) => {
                  const isCorrect = answers[i] === q.correctAnswer;
                  return (
                    <div key={q.id} className={cn("p-3 rounded-lg border", isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5")}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {t.question} {q.id}
                        </span>
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-lg">
                        {q.pattern.map((item, pi) => (
                          <span key={pi} className={item === "?" ? "text-primary font-bold" : ""}>{item}</span>
                        ))}
                      </div>
                      {!isCorrect && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {t.correct}: {q.options[q.correctAnswer]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="text-center">
              <Button size="lg" onClick={startTest} className="gap-2">
                <RotateCcw className="h-5 w-5" />
                {t.tryAgain}
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </div>
  );
};

export default IQTest;
