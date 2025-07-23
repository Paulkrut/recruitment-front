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
    title: "Настройки",
    icon: 'settings-linear',
    href: "/hr/settings",
    bgcolor: "grey",
  },
];

export default Menuitems;
