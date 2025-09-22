"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FooterLinks(){
  const pathname = usePathname();
  const show = pathname === "/"; // показываем футер только на главной
  if(!show) return null;
  return (
    <footer style={{borderTop:'1px solid #e5e7eb',marginTop:48}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'16px',display:'flex',flexWrap:'wrap',gap:12,fontSize:14,color:'#6b7280'}}>
        <Link href="/privacy-policy">Политика обработки ПДн</Link>
        <Link href="/hr-agreement">Оферта для рекрутёров</Link>
        <Link href="/terms-of-service">Условия использования</Link>
        <Link href="/forget-me">Удаление моих данных</Link>
        <Link href="/contact">Контакты</Link>
      </div>
    </footer>
  );
} 