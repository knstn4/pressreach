import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import image from "../assets/growth.png";
import image3 from "../assets/reflecting.png";
import image4 from "../assets/looking-ahead.png";

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: "AI-генерация",
    description:
      "Используем передовые модели искусственного интеллекта для создания профессиональных пресс-релизов, обученные на тысячах успешных примеров",
    image: image4,
  },
  {
    title: "7 типов пресс-релизов",
    description:
      "Поддержка различных форматов: запуск продукта, партнёрство, инвестиции, достижения, события, кадровые изменения и корпоративные новости",
    image: image3,
  },
  {
    title: "Мгновенный результат",
    description:
      "Получайте готовый профессиональный пресс-релиз за 1-2 минуты вместо нескольких часов ручной работы",
    image: image,
  },
];

const featureList: string[] = [
  "AI-генерация",
  "7 типов релизов",
  "Быстрая генерация",
  "Профессиональное качество",
  "Удобный интерфейс",
  "Экспорт результатов",
  "Адаптивный дизайн",
  "Тёмная тема",
  "Бесплатный доступ",
];

export const Features = () => {
  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Множество{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          полезных возможностей
        </span>
      </h2>

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge
              variant="secondary"
              className="text-sm"
            >
              {feature}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image }: FeatureProps) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>

            <CardFooter>
              <img
                src={image}
                alt="About feature"
                className="w-[200px] lg:w-[300px] mx-auto"
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
