import { Badge } from "./ui/badge";
import { Sparkles, Brain, Send, Zap } from "lucide-react";

export const HeroCards = () => {
  return (
    <div className="hidden lg:flex relative w-[700px] h-[500px] items-center justify-center">
      {/* Центральная орбита с AI */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Главный элемент - AI Brain */}
        <div className="relative animate-float">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="relative backdrop-blur-xl bg-gradient-to-br from-background/80 via-background/60 to-background/80 border border-primary/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-2xl blur-xl opacity-50" />
                <div className="relative bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 rounded-2xl">
                  <Brain className="w-16 h-16 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  AI Engine
                </h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Генерация за секунды
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Орбитальные элементы */}
        {/* 1. Input - слева */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 animate-float-delayed-1">
          <div className="backdrop-blur-xl bg-gradient-to-br from-background/70 to-background/50 border border-primary/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Ваша новость</p>
                <p className="text-xs text-muted-foreground">Просто опишите</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Processing - правая верхняя */}
        <div className="absolute right-8 top-8 animate-float-delayed-2">
          <div className="backdrop-blur-xl bg-gradient-to-br from-background/70 to-background/50 border border-purple-500/10 rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:border-purple-500/30 transition-all duration-300 group">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
              <p className="text-xs font-medium">Анализ контекста</p>
            </div>
          </div>
        </div>

        {/* 3. Output - справа */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 animate-float-delayed-3">
          <div className="backdrop-blur-xl bg-gradient-to-br from-background/70 to-background/50 border border-primary/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Пресс-релиз</p>
                <p className="text-xs text-muted-foreground">Готов к отправке</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Distribution - правая нижняя */}
        <div className="absolute right-8 bottom-8 animate-float-delayed-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-background/70 to-background/50 border border-emerald-500/10 rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-500" />
              <p className="text-xs font-medium">Рассылка в СМИ</p>
            </div>
          </div>
        </div>

        {/* 5. Models - левая нижняя */}
        <div className="absolute left-8 bottom-8 animate-float-delayed-5">
          <div className="backdrop-blur-xl bg-gradient-to-br from-background/70 to-background/50 border border-primary/10 rounded-2xl p-4 shadow-xl">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5 backdrop-blur">
                GPT-4
              </Badge>
              <Badge variant="outline" className="text-xs border-purple-500/20 bg-purple-500/5 backdrop-blur">
                Claude
              </Badge>
            </div>
          </div>
        </div>

        {/* 6. Speed - левая верхняя */}
        <div className="absolute left-8 top-8 animate-float-delayed-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-background/70 to-background/50 border border-orange-500/10 rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:border-orange-500/30 transition-all duration-300 group">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <p className="text-xs font-medium">Мгновенно</p>
            </div>
          </div>
        </div>

        {/* Соединительные линии (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Линия от Input к Center */}
          <line
            x1="120" y1="50%"
            x2="300" y2="50%"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            className="text-primary animate-pulse"
          />
          {/* Линия от Center к Output */}
          <line
            x1="400" y1="50%"
            x2="580" y2="50%"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            className="text-primary animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
        </svg>

        {/* Фоновые декоративные элементы */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed-1 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 0.2s;
        }

        .animate-float-delayed-2 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 0.4s;
        }

        .animate-float-delayed-3 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 0.6s;
        }

        .animate-float-delayed-4 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 0.8s;
        }

        .animate-float-delayed-5 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-float-delayed-6 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 1.2s;
        }
      `}</style>
    </div>
  );
};