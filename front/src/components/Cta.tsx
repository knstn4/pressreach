import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export const Cta = () => {
  return (
    <section
      id="cta"
      className="bg-muted/50 py-16 my-24 sm:my-32"
    >
      <div className="container lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl md:text-4xl font-bold ">
            Создавайте
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              {" "}
              профессиональные пресс-релизы{" "}
            </span>
            за минуты
          </h2>
          <p className="text-muted-foreground text-xl mt-4 mb-8 lg:mb-0">
            Начните использовать наш AI-генератор прямо сейчас. Быстро, удобно и абсолютно бесплатно.
            Присоединяйтесь к тысячам компаний, которые уже доверяют PressReach.
          </p>
        </div>

        <div className="space-y-4 lg:col-start-2">
          <Link to="/generator">
            <Button className="w-full md:mr-4 md:w-auto" size="lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Создать пресс-релиз
            </Button>
          </Link>
          <Link to="/improve-text">
            <Button
              variant="secondary"
              className="w-full md:mr-4 md:w-auto"
              size="lg"
            >
              ✨ Улучшить текст
            </Button>
          </Link>
          <a href="#features">
            <Button
              variant="outline"
              className="w-full md:w-auto"
              size="lg"
            >
              Все возможности
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
