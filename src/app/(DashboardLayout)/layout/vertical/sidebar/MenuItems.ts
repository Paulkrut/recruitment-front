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
    navlabel: true,
    subheader: "Управление HR",
  },
  {
    id: uniqueId(),
    title: "Главная",
    icon: 'briefcase-line-duotone',
    href: "/hr/",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "Кандидаты",
    icon: 'users-group-line-duotone',
    href: "/hr/candidates",
    bgcolor: "success",
  },
  {
    id: uniqueId(),
    title: "Вакансии",
    icon: 'work-line-duotone',
    href: "/hr/vacancies",
    bgcolor: "warning",
  },
  {
    id: uniqueId(),
    title: "Создать вакансию",
    icon: 'plus-line-duotone',
    href: "/hr/vacancy-create",
    bgcolor: "success",
  },
];

export default Menuitems;
