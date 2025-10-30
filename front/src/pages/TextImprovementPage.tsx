import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, ArrowLeft, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/config";

interface ImprovementResult {
  original_text: string;
  improved_text?: string;
  rewritten_text?: string;
  errors_found?: Array<{
    type: string;
    original: string;
    corrected: string;
    explanation: string;
  }>;
  key_changes?: string[];
  summary: string;
  style_applied?: string;
}

export const TextImprovementPage = () => {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"grammar" | "rewrite">("grammar");
  const [style, setStyle] = useState("formal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImprovementResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Улучшение текста | PressReach";
  }, []);

  const writingStyles = [
    { value: "formal", label: "📋 Официальный", description: "Для документов и официальных сообщений" },
    { value: "business", label: "💼 Деловой", description: "Для корпоративной переписки" },
    { value: "casual", label: "😊 Неформальный", description: "Для блогов и соцсетей" },
    { value: "journalistic", label: "📰 Журналистский", description: "Для новостей и статей" },
    { value: "academic", label: "🎓 Академический", description: "Для научных работ" },
    { value: "marketing", label: "📢 Маркетинговый", description: "С призывами к действию" },
    { value: "concise", label: "⚡ Краткий", description: "Лаконичный без деталей" },
  ];

  const handleImprove = async () => {
    if (!text.trim()) {
      setError("Пожалуйста, введите текст для улучшения");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/improve-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          mode: mode,
          style: mode === "rewrite" ? style : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || "Произошла ошибка при улучшении текста");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером. Проверьте, что бэкенд запущен.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    alert("Текст скопирован в буфер обмена!");
  };

  const getImprovedText = () => {
    if (!result) return "";
    return result.improved_text || result.rewritten_text || "";
  };

  // Результат
  if (result) {
    const improvedText = getImprovedText();

    return (
      <section className="container py-20 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" className="mb-4" onClick={handleReset}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Улучшить ещё текст
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Текст улучшен! ✨
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Исходный текст</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {result.original_text}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Улучшенный текст
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
                  <p className="whitespace-pre-wrap">{improvedText}</p>
                </div>
                <Button onClick={() => copyToClipboard(improvedText)} size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Копировать
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Информация об изменениях */}
          <Card>
            <CardHeader>
              <CardTitle>Детали улучшения</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Режим грамматики */}
              {mode === "grammar" && result.errors_found && result.errors_found.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Найдено и исправлено ошибок: {result.errors_found.length}</h3>
                  <div className="space-y-3">
                    {result.errors_found.map((error, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline">{error.type}</Badge>
                          <div className="flex-1">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div>
                                <span className="text-xs text-muted-foreground">Было:</span>
                                <p className="text-sm text-destructive line-through">{error.original}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Стало:</span>
                                <p className="text-sm text-primary font-medium">{error.corrected}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{error.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Режим переписывания */}
              {mode === "rewrite" && result.key_changes && result.key_changes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Ключевые изменения:</h3>
                  <ul className="space-y-2">
                    {result.key_changes.map((change, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Резюме */}
              {result.summary && (
                <div className="bg-primary/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Резюме:</h3>
                  <p className="text-sm">{result.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Форма ввода
  return (
    <section className="container py-20 md:py-32">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              На главную
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Улучшение текста
          </h1>
          <p className="text-xl text-muted-foreground">
            Проверьте грамматику или переписайте текст в нужном стиле
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ваш текст</CardTitle>
            <CardDescription>
              Вставьте текст, который хотите улучшить
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text">Текст для улучшения</Label>
              <Textarea
                id="text"
                placeholder="Вставьте ваш текст здесь..."
                rows={12}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {text.length} символов
              </p>
            </div>

            <Tabs value={mode} onValueChange={(value) => setMode(value as "grammar" | "rewrite")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grammar">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Проверка грамматики
                </TabsTrigger>
                <TabsTrigger value="rewrite">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Переписать в стиле
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grammar" className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Что делает эта функция:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Исправляет орфографические ошибки</li>
                    <li>✓ Проверяет пунктуацию</li>
                    <li>✓ Находит грамматические ошибки</li>
                    <li>✓ Сохраняет исходный стиль и смысл</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="rewrite" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Выберите стиль</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {writingStyles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <div className="flex flex-col items-start">
                            <span>{s.label}</span>
                            <span className="text-xs text-muted-foreground">{s.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Что делает эта функция:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Адаптирует текст под выбранный стиль</li>
                    <li>✓ Улучшает читаемость и структуру</li>
                    <li>✓ Исправляет все ошибки</li>
                    <li>✓ Сохраняет ключевые факты и смысл</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                ⚠️ {error}
              </div>
            )}

            <Button
              onClick={handleImprove}
              size="lg"
              className="w-full"
              disabled={isProcessing || !text.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {mode === "grammar" ? "Проверить и исправить" : "Переписать текст"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
