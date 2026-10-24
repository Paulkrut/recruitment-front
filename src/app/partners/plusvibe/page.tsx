import type { Metadata } from "next";
import PlusVibePartnerContent from "./PlusVibePartnerContent";

export const metadata: Metadata = {
  title: "PlusVibe — технологический партнёр SofiHR",
  description:
    "PlusVibe предоставил вычислительные мощности для масштабного тестирования алгоритмов оценки кандидатов SofiHR. История технологического партнёрства.",
};

export default function PlusVibePartnerPage() {
  return <PlusVibePartnerContent />;
}
