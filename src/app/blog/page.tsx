import type { Metadata } from "next";
import BlogIndexContent from "./BlogIndexContent";

export const metadata: Metadata = {
  title: "Блог SofiHR — про найм, AI и технологии рекрутинга",
  description:
    "Статьи о технологиях AI-рекрутинга, партнёрствах и практике автоматизации найма в SofiHR.",
};

export default function BlogPage() {
  return <BlogIndexContent />;
}
