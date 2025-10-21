import { Button } from "./ui/button";
import { buttonVariants } from "./ui/button";
import { HeroCards } from "./HeroCards";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              PressReach
            </span>{" "}
          </h1>
          <h2 className="inline">
            AI-генератор{" "}
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              пресс-релизов
            </span>
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Создавайте профессиональные пресс-релизы за минуты с помощью искусственного интеллекта.
          Быстро, качественно, без усилий.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link to="/generator">
            <Button className="w-full md:w-auto" size="lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Создать пресс-релиз
            </Button>
          </Link>

          <Link to="/improve-text">
            <Button variant="secondary" className="w-full md:w-auto" size="lg">
              ✨ Улучшить текст
            </Button>
          </Link>

          <a
            href="#features"
            className={`w-full md:w-auto ${buttonVariants({
              variant: "outline",
              size: "lg"
            })}`}
          >
            Узнать больше
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10">
        <HeroCards />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
