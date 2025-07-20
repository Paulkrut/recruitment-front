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
    icon: 'briefcase-line-duotone',
    href: "/hr/",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "Вакансии",
    icon: 'work-line-duotone',
    href: "/hr/vacancies",
    bgcolor: "warning",
  },
];

export default Menuitems;
