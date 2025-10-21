import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, Sparkles, Download, CheckCircle2 } from "lucide-react";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <FileText className="w-10 h-10" />,
    title: "Введите информацию",
    description:
      "Укажите название компании, опишите новость и добавьте ключевые детали о событии",
  },
  {
    icon: <Sparkles className="w-10 h-10" />,
    title: "AI создаёт пресс-релиз",
    description:
      "Наш AI анализирует данные и генерирует профессиональный пресс-релиз за 1-2 минуты",
  },
  {
    icon: <CheckCircle2 className="w-10 h-10" />,
    title: "Проверьте результат",
    description:
      "Получите готовый текст с заголовком, лид-абзацем, цитатами и контактной информацией",
  },
  {
    icon: <Download className="w-10 h-10" />,
    title: "Скачайте или скопируйте",
    description:
      "Экспортируйте готовый пресс-релиз в удобном формате или скопируйте в буфер обмена",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        Как это{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          работает{" "}
        </span>
        - пошаговый процесс
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Всего 4 простых шага от идеи до готового профессионального пресс-релиза
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-muted/50"
          >
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
