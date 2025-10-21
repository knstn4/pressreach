import { useEffect } from "react";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { Features } from "../components/Features";
import { Cta } from "../components/Cta";
import { FAQ } from "../components/FAQ";

export const HomePage = () => {
  useEffect(() => {
    document.title = "PressReach - Автоматизация пресс-релизов с помощью AI";
  }, []);

  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <Cta />
      <FAQ />
    </>
  );
};
