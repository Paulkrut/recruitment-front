import { uniqueId } from "lodash";
import { msg } from "@lingui/macro";
import { MessageDescriptor } from "@lingui/core";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string | MessageDescriptor;
  title?: string | MessageDescriptor;
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
    title: msg`Главная`,
    icon: 'home-2-linear',
    href: "/hr/",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: msg`Вакансии`,
    icon: 'checklist-linear',
    href: "/hr/vacancies",
    bgcolor: "warning",
  },
  {
    id: uniqueId(),
    title: msg`Кандидаты`,
    icon: 'user-check-linear',
    href: "/hr/candidates",
    bgcolor: "secondary",
  },
  {
    id: uniqueId(),
    title: msg`Брендирование`,
    icon: 'palette-linear',
    href: "/hr/settings?tab=branding",
    bgcolor: "success",
  },
  {
    id: uniqueId(),
    title: msg`Компании`,
    icon: 'buildings-3-linear',
    href: "/hr/choose-company",
    bgcolor: "warning",
  },
  {
    id: uniqueId(),
    title: msg`Сотрудники`,
    icon: 'users-group-rounded-linear',
    href: "/hr/employees",
    bgcolor: "info",
  },
  {
    id: uniqueId(),
    title: msg`HH.ru интеграция`,
    icon: 'link-square-linear',
    href: "/hr/settings/hh-integration",
    bgcolor: "error",
  },
  {
    id: uniqueId(),
    navlabel: true,
    subheader: msg`Тестирование сотрудников`,
  },
  {
    id: uniqueId(),
    title: msg`Регламенты`,
    icon: 'document-text-linear',
    href: "/hr/regulations",
    bgcolor: "success",
  },
  {
    id: uniqueId(),
    title: msg`Тесты`,
    icon: 'clipboard-text-linear',
    href: "/hr/regulation-tests",
    bgcolor: "info",
  },
  {
    id: uniqueId(),
    navlabel: true,
    subheader: msg`Биллинг и тарифы`,
  },
  {
    id: uniqueId(),
    title: msg`Тарифные планы`,
    icon: 'card-linear',
    href: "/hr/billing",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: msg`История операций`,
    icon: 'bill-list-linear',
    href: "/hr/billing/transactions",
    bgcolor: "info",
  },
  {
    id: uniqueId(),
    title: msg`Аналитика`,
    icon: 'chart-2-linear',
    href: "/hr/billing/analytics",
    bgcolor: "success",
  },
  {
    id: uniqueId(),
    navlabel: true,
    subheader: msg`Система`,
  },
  {
    id: uniqueId(),
    title: msg`Настройки`,
    icon: 'settings-linear',
    href: "/hr/settings",
    bgcolor: "grey",
  },

  {
    id: uniqueId(),
    title: msg`Запросы на удаление`,
    icon: 'close-circle-linear',
    href: "/hr/forget-me-requests",
    bgcolor: "warning",
  }
];

export default Menuitems;
