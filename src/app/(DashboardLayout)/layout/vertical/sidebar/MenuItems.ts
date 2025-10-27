import { uniqueId } from "lodash";
interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  bgcolor?: any;
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}

const Menuitems: MenuitemsType[] = [
  {
    id: uniqueId(),
    title: "Главная",
    icon: 'home-2-linear',
    href: "/hr/",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "Вакансии",
    icon: 'checklist-linear',
    href: "/hr/vacancies",
    bgcolor: "warning",
  },
  {
    id: uniqueId(),
    title: "Кандидаты",
    icon: 'user-check-linear',
    href: "/hr/candidates",
    bgcolor: "secondary",
  },
  {
    id: uniqueId(),
    title: "Брендирование",
    icon: 'palette-linear',
    href: "/hr/settings?tab=branding",
    bgcolor: "success",
  },
  {
    id: uniqueId(),
    title: "Компании",
    icon: 'buildings-3-linear',
    href: "/hr/choose-company",
    bgcolor: "warning",
  },
  {
    id: uniqueId(),
    title: "Сотрудники",
    icon: 'users-group-rounded-linear',
    href: "/hr/employees",
    bgcolor: "info",
  },
  {
    id: uniqueId(),
    title: "HH.ru интеграция",
    icon: 'link-square-linear',
    href: "/hr/settings/hh-integration",
    bgcolor: "error",
  },
  {
    id: uniqueId(),
    navlabel: true,
    subheader: "Тестирование сотрудников",
  },
  {
    id: uniqueId(),
    title: "Регламенты",
    icon: 'document-text-linear',
    href: "/hr/regulations",
    bgcolor: "success",
  },
  {
    id: uniqueId(),
    title: "Тесты",
    icon: 'clipboard-text-linear',
    href: "/hr/regulation-tests",
    bgcolor: "info",
  },
  {
    id: uniqueId(),
    navlabel: true,
    subheader: "Биллинг и тарифы",
  },
  {
    id: uniqueId(),
    title: "Тарифные планы",
    icon: 'card-linear',
    href: "/hr/billing",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "История операций",
    icon: 'bill-list-linear',
    href: "/hr/billing/transactions",
    bgcolor: "info",
  },
  {
    id: uniqueId(),
    title: "Аналитика",
    icon: 'chart-2-linear',
    href: "/hr/billing/analytics",
    bgcolor: "success",
  },
  {
    id: uniqueId(),
    navlabel: true,
    subheader: "Система",
  },
  {
    id: uniqueId(),
    title: "Настройки",
    icon: 'settings-linear',
    href: "/hr/settings",
    bgcolor: "grey",
  },

  {
    id: uniqueId(),
    title: "Запросы на удаление",
    icon: 'close-circle-linear',
    href: "/hr/forget-me-requests",
    bgcolor: "warning",
  }
];

export default Menuitems;
