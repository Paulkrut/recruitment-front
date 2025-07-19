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
    subheader: "HR Management",
  },
  {
    id: uniqueId(),
    title: "HR Dashboard",
    icon: 'briefcase-line-duotone',
    href: "/hr/dashboard",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "Candidates",
    icon: 'users-group-line-duotone',
    href: "/hr/candidates",
    bgcolor: "success",
  },
  {
    id: uniqueId(),
    title: "Vacancies",
    icon: 'work-line-duotone',
    href: "/hr/vacancies",
    bgcolor: "warning",
  },
  {
    id: uniqueId(),
    title: "Create Vacancy",
    icon: 'plus-line-duotone',
    href: "/hr/vacancy-create",
    bgcolor: "success",
  },
];

export default Menuitems;
