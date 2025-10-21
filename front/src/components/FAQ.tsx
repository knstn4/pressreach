import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Что такое PressReach и как это работает?",
    answer: "PressReach — это платформа для автоматизации пресс-релизов. Мы помогаем создавать профессиональные пресс-релизы с помощью AI, управлять базой СМИ и отправлять персонализированные рассылки. Просто введите информацию о вашем событии, и наш AI генератор создаст готовый пресс-релиз за минуты.",
    value: "item-1",
  },
  {
    question: "Какие возможности дает система брендинга?",
    answer: "Система брендинга позволяет полностью персонализировать ваши рассылки: загрузить логотип компании, настроить фирменные цвета, добавить контактную информацию, ссылки на социальные сети и создать профессиональную email-подпись. Все ваши письма будут автоматически оформлены в едином стиле.",
    value: "item-2",
  },
  {
    question: "Сколько стоит использование PressReach?",
    answer: "Мы предлагаем несколько тарифных планов: бесплатный Free (3 релиза в месяц), Starter ($29/месяц, 10 релизов), Professional ($99/месяц, неограниченно) и Enterprise с индивидуальными условиями. Каждый план включает разное количество кредитов для рассылок.",
    value: "item-3",
  },
  {
    question: "Как работает AI-генерация пресс-релизов?",
    answer: "Наш AI, работающий на базе передовых языковых моделей, анализирует вашу информацию и создает структурированный, профессиональный пресс-релиз в соответствии с журналистскими стандартами. Вы также можете улучшить существующий текст или адаптировать его под конкретные СМИ.",
    value: "item-4",
  },
  {
    question: "Могу ли я управлять базой СМИ самостоятельно?",
    answer: "Да! У вас есть полный доступ к управлению базой СМИ. Вы можете добавлять новые медиа-площадки, редактировать контактную информацию, фильтровать по категориям и отслеживать статистику по каждому изданию. База данных постоянно обновляется.",
    value: "item-5",
  },
  {
    question: "Гарантируете ли вы публикацию в СМИ?",
    answer: "Мы обеспечиваем профессиональную доставку вашего пресс-релиза в выбранные СМИ, но окончательное решение о публикации принимает редакция издания. Наша задача — максимально увеличить ваши шансы на публикацию через качественный контент, таргетированную рассылку и персонализацию.",
    value: "item-6",
  },
];

export const FAQ = () => {
  return (
    <section
      id="faq"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Часто задаваемые{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          вопросы
        </span>
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Остались вопросы?{" "}
        <a
          rel="noreferrer noopener"
          href="mailto:support@pressreach.com"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Свяжитесь с нами
        </a>
      </h3>
    </section>
  );
};
