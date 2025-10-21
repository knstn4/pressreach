import { LogoIcon } from "./Icons";

export const Footer = () => {
  return (
    <footer id="footer">
      <hr className="w-11/12 mx-auto" />

      <section className="container py-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
        <div className="col-span-full xl:col-span-2">
          <a
            rel="noreferrer noopener"
            href="/"
            className="font-bold text-xl flex"
          >
            <LogoIcon />
            PressReach
          </a>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Автоматизация пресс-релизов с помощью AI. Создавайте, персонализируйте и отправляйте профессиональные рассылки в СМИ.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Продукт</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="/generator"
              className="opacity-60 hover:opacity-100"
            >
              AI Генератор
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/distribution"
              className="opacity-60 hover:opacity-100"
            >
              Рассылка
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/media-management"
              className="opacity-60 hover:opacity-100"
            >
              База СМИ
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/branding"
              className="opacity-60 hover:opacity-100"
            >
              Брендинг
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Компания</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="/#features"
              className="opacity-60 hover:opacity-100"
            >
              Возможности
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/#pricing"
              className="opacity-60 hover:opacity-100"
            >
              Тарифы
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/#faq"
              className="opacity-60 hover:opacity-100"
            >
              FAQ
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/about"
              className="opacity-60 hover:opacity-100"
            >
              О нас
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Ресурсы</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="/docs"
              className="opacity-60 hover:opacity-100"
            >
              Документация
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/blog"
              className="opacity-60 hover:opacity-100"
            >
              Блог
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/support"
              className="opacity-60 hover:opacity-100"
            >
              Поддержка
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/api"
              className="opacity-60 hover:opacity-100"
            >
              API
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Соцсети</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="https://twitter.com/pressreach"
              target="_blank"
              className="opacity-60 hover:opacity-100"
            >
              Twitter
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="https://linkedin.com/company/pressreach"
              target="_blank"
              className="opacity-60 hover:opacity-100"
            >
              LinkedIn
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="https://t.me/pressreach"
              target="_blank"
              className="opacity-60 hover:opacity-100"
            >
              Telegram
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="https://github.com/pressreach"
              target="_blank"
              className="opacity-60 hover:opacity-100"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="container pb-14 text-center">
        <h3 className="text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} PressReach. Все права защищены.{" "}
          <span className="mx-2">•</span>
          <a
            rel="noreferrer noopener"
            href="/privacy"
            className="text-primary transition-all border-primary hover:border-b-2"
          >
            Политика конфиденциальности
          </a>
          <span className="mx-2">•</span>
          <a
            rel="noreferrer noopener"
            href="/terms"
            className="text-primary transition-all border-primary hover:border-b-2"
          >
            Условия использования
          </a>
        </h3>
      </section>
    </footer>
  );
};
