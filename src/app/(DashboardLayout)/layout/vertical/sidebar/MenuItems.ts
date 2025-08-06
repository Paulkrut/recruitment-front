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
    title: "Настройки",
    icon: 'settings-linear',
    href: "/hr/settings",
    bgcolor: "grey",
  }
];

export default Menuitems;
