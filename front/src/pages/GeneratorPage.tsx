import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, Printer, ArrowLeft, Sparkles, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "@/config";

interface PressRelease {
  headline: string;
  subheadline: string;
  lead_paragraph: string;
  body_text: string;
  quotes?: Array<{
    text: string;
    author: string;
  }>;
  contact_info?: string;
  boilerplate?: string;
}

export const GeneratorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    newsSummary: "",
    type: "product_launch",
    targetAudience: "Широкая аудитория",
    additionalInfo: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PressRelease | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Генератор пресс-релизов | PressReach";
  }, []);

  const pressReleaseTypes = [
    { value: "product_launch", label: "🚀 Запуск продукта" },
    { value: "company_news", label: "📰 Новость компании" },
    { value: "partnership", label: "🤝 Партнёрство" },
    { value: "funding", label: "💰 Привлечение инвестиций" },
    { value: "achievement", label: "🏆 Достижение" },
    { value: "event", label: "🎉 Событие" },
    { value: "personnel", label: "👔 Кадровые изменения" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.newsSummary) {
      setError("Пожалуйста, заполните обязательные поля");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/generate-press-release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: formData.companyName,
          news_summary: formData.newsSummary,
          type: formData.type,
          target_audience: formData.targetAudience,
          additional_info: formData.additionalInfo,
          key_messages: [],
          quotes: [],
          contact_person: "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.press_release);
      } else {
        setError(data.detail || "Произошла ошибка при генерации");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером. Проверьте, что бэкенд запущен.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const copyToClipboard = () => {
    if (!result) return;

    const text = `${result.headline}\n\n${result.subheadline}\n\n${result.lead_paragraph}\n\n${result.body_text}\n\n${
      result.quotes?.map((q) => `"${q.text}" - ${q.author}`).join("\n\n") || ""
    }\n\n${result.contact_info || ""}\n\n${result.boilerplate || ""}`;

    navigator.clipboard.writeText(text);
    alert("Текст скопирован в буфер обмена!");
  };

  const handleSendToMedia = () => {
    if (!result) return;

    const fullText = `${result.lead_paragraph}\n\n${result.body_text}\n\n${
      result.quotes?.map((q) => `"${q.text}" - ${q.author}`).join("\n\n") || ""
    }\n\n${result.contact_info || ""}\n\n${result.boilerplate || ""}`;

    navigate('/distribution', {
      state: {
        pressReleaseTitle: result.headline,
        pressReleaseContent: fullText,
        companyName: formData.companyName,
      }
    });
  };

  // Результат
  if (result) {
    return (
      <section className="container py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                На главную
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Ваш пресс-релиз готов! 🎉
            </h1>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <Button onClick={handleSendToMedia} size="lg" className="bg-green-600 hover:bg-green-700">
              <Send className="mr-2 h-4 w-4" />
              Отправить в СМИ
            </Button>
            <Button onClick={copyToClipboard} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Копировать
            </Button>
            <Button onClick={() => window.print()} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Печать
            </Button>
            <Button onClick={handleReset} variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Создать новый
            </Button>
          </div>

          <Card className="prose prose-slate max-w-none dark:prose-invert">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{result.headline}</h1>
                {result.subheadline && (
                  <h2 className="text-xl md:text-2xl text-muted-foreground font-medium">
                    {result.subheadline}
                  </h2>
                )}
              </div>

              <div className="border-l-4 border-primary pl-6 py-2">
                <p className="text-lg leading-relaxed">{result.lead_paragraph}</p>
              </div>

              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {result.body_text}
              </div>

              {result.quotes && result.quotes.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  {result.quotes.map((quote, index) => (
                    <blockquote key={index} className="border-l-4 border-primary pl-4 italic">
                      <p className="text-lg mb-2">"{quote.text}"</p>
                      <cite className="text-sm text-muted-foreground not-italic font-medium">
                        — {quote.author}
                      </cite>
                    </blockquote>
                  ))}
                </div>
              )}

              {result.contact_info && (
                <div className="bg-muted/30 rounded-lg p-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Контакты для СМИ
                  </h4>
                  <p className="text-sm">{result.contact_info}</p>
                </div>
              )}

              {result.boilerplate && (
                <div className="bg-muted/30 rounded-lg p-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    О компании
                  </h4>
                  <p className="text-sm leading-relaxed">{result.boilerplate}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Форма генерации
  return (
    <section className="container py-20 md:py-32">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              На главную
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Генератор пресс-релизов
          </h1>
          <p className="text-xl text-muted-foreground">
            Заполните форму, и AI создаст профессиональный пресс-релиз за минуты
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Информация о пресс-релизе</CardTitle>
            <CardDescription>
              Заполните все обязательные поля, чтобы получить качественный результат
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Название компании <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="Например: TechCorp"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsSummary">
                  Краткое описание новости <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="newsSummary"
                  placeholder="Опишите главную новость в 2-3 предложениях..."
                  rows={4}
                  value={formData.newsSummary}
                  onChange={(e) =>
                    setFormData({ ...formData, newsSummary: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Тип пресс-релиза</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pressReleaseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Целевая аудитория</Label>
                  <Input
                    id="targetAudience"
                    placeholder="Например: Технические специалисты"
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAudience: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Дополнительная информация</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Добавьте любые детали, которые должны быть включены..."
                  rows={3}
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalInfo: e.target.value })
                  }
                />
              </div>

              {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                  ⚠️ {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Сгенерировать пресс-релиз
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
