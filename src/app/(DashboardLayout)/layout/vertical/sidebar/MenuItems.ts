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
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Dashboard 1",
    icon: 'screencast-2-line-duotone',
    href: "/",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "Dashboard 2",
    icon: 'chart-line-duotone',
    href: "/dashboards/dashboard2",
    bgcolor: "secondary",
  },
  {
    navlabel: true,
    subheader: "Apps",
  },
  {
    id: uniqueId(),
    title: "Contacts",
    icon: 'phone-line-duotone',
    chip: "2",
    chipColor: "secondary",
    href: "/apps/contacts",
    bgcolor: "success",
  },

  {
    id: uniqueId(),
    title: "Blog",
    icon: 'align-vertical-spacing-line-duotone',
    href: "/apps/blog/",
    bgcolor: "warning",
    children: [
      {
        id: uniqueId(),
        title: "Posts",
        href: "/apps/blog/post",
      },
      {
        id: uniqueId(),
        title: "Detail",
        href: "/apps/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Ecommerce",
    icon: 'smart-speaker-minimalistic-line-duotone',
    href: "/apps/ecommerce/",
    bgcolor: "error",
    children: [
      {
        id: uniqueId(),
        title: "Shop",
        href: "/apps/ecommerce/shop",
      },
      {
        id: uniqueId(),
        title: "Shop V2",
        href: "/apps/ecommerce/shop2",
      },
      {
        id: uniqueId(),
        title: "Detail",
        href: "/apps/ecommerce/detail/1",
      },
      {
        id: uniqueId(),
        title: "Detail V2",
        href: "/apps/ecommerce/detail2/1",
      },
      {
        id: uniqueId(),
        title: "List",
        href: "/apps/ecommerce/list",
      },
      {
        id: uniqueId(),
        title: "Checkout",
        href: "/apps/ecommerce/checkout",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Chats",
    icon: 'chat-round-unread-line-duotone',
    bgcolor: "info",
    href: "/apps/chats",
  },
  {
    id: uniqueId(),
    title: "Users",
    icon: 'user-rounded-line-duotone',
    href: "/apps/user-profile/profile",
    bgcolor: "primary",
    children: [
      {
        id: uniqueId(),
        title: "Profile",
        href: "/apps/user-profile/profile",
      },
      {
        id: uniqueId(),
        title: "Followers",
        href: "/apps/user-profile/followers",
      },
      {
        id: uniqueId(),
        title: "Friends",
        href: "/apps/user-profile/friends",
      },
      {
        id: uniqueId(),
        title: "Gallery",
        href: "/apps/user-profile/gallery",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Users v2",
    icon: 'user-speak-line-duotone',
    bgcolor: "success",
    href: "/apps/user-profile2/profile",
    children: [
      {
        id: uniqueId(),
        title: "Profile",
        href: "/apps/user-profile2/profile",
      },
      {
        id: uniqueId(),
        title: "Teams",
        href: "/apps/user-profile2/teams",
      },
      {
        id: uniqueId(),
        title: "Projects",
        href: "/apps/user-profile2/projects",
      },
      {
        id: uniqueId(),
        title: "Connections",
        href: "/apps/user-profile2/connections",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Notes",
    icon: 'notification-unread-line-duotone',
    bgcolor: "secondary",
    href: "/apps/notes",
  },
  {
    id: uniqueId(),
    title: "Calendar",
    icon: 'calendar-line-duotone',
    bgcolor: "success",
    href: "/apps/calendar",
  },
  {
    id: uniqueId(),
    title: "Email",
    icon: 'mailbox-line-duotone',
    bgcolor: "warning",
    href: "/apps/email",
  },
  {
    id: uniqueId(),
    title: "Tickets",
    icon: 'ticket-sale-line-duotone',
    bgcolor: "error",
    href: "/apps/tickets",
  },
  {
    navlabel: true,
    subheader: "Pages",
  },

  {
    id: uniqueId(),
    title: 'Roll Base Access',
    icon: 'archive-minimalistic-outline',
    bgcolor: "success",
    href: '/theme-pages/casl',
  },
  {
    id: uniqueId(),
    title: "Treeview",
    icon: 'align-vertical-center-line-duotone',
    bgcolor: "info",
    href: "/theme-pages/treeview",
  },
  {
    id: uniqueId(),
    title: "Pricing",
    icon: 'tag-price-line-duotone',
    href: "/theme-pages/pricing",
  },
  {
    id: uniqueId(),
    title: "Account Setting",
    icon: 'settings-minimalistic-line-duotone',
    bgcolor: "secondary",
    href: "/theme-pages/account-settings",
  },
  {
    id: uniqueId(),
    title: "FAQ",
    icon: 'question-circle-line-duotone',
    bgcolor: "success",
    href: "/theme-pages/faq",
  },
  {
    id: uniqueId(),
    title: "Landingpage",
    icon: 'layers-minimalistic-line-duotone',
    bgcolor: "warning",
    href: "/landingpage",
  },
  {
    id: uniqueId(),
    title: "Widgets",
    icon: 'widget-add-line-duotone',
    bgcolor: "error",
    href: "/widgets/cards",
    children: [
      {
        id: uniqueId(),
        title: "Cards",
        href: "/widgets/cards",
      },
      {
        id: uniqueId(),
        title: "Banners",
        href: "/widgets/banners",
      },
      {
        id: uniqueId(),
        title: "Charts",
        href: "/widgets/charts",
      },
    ],
  },
  {
    navlabel: true,
    subheader: "Forms",
  },
  {
    id: uniqueId(),
    title: "Form Elements",
    icon: 'widget-3-line-duotone',
    bgcolor: "info",
    href: "/forms/form-elements/autocomplete",
    children: [
      {
        id: uniqueId(),
        title: "Autocomplete",
        href: "/forms/form-elements/autocomplete",
      },
      {
        id: uniqueId(),
        title: "Button",
        href: "/forms/form-elements/button",
      },
      {
        id: uniqueId(),
        title: "Checkbox",
        href: "/forms/form-elements/checkbox",
      },
      {
        id: uniqueId(),
        title: "Radio",
        href: "/forms/form-elements/radio",
      },
      {
        id: uniqueId(),
        title: "Date Time",
        href: "/forms/form-elements/date-time",
      },
      {
        id: uniqueId(),
        title: "Slider",
        href: "/forms/form-elements/slider",
      },
      {
        id: uniqueId(),
        title: "Switch",
        href: "/forms/form-elements/switch",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Form Layout",
    icon: 'widget-5-line-duotone',
    href: "/forms/form-layout",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "Form Horizontal",
    icon: 'posts-carousel-horizontal-line-duotone',
    bgcolor: "secondary",
    href: "/forms/form-horizontal",
  },
  {
    id: uniqueId(),
    title: "Form Vertical",
    icon: 'posts-carousel-vertical-line-duotone',
    bgcolor: "success",
    href: "/forms/form-vertical",
  },
  {
    id: uniqueId(),
    title: "Form Custom",
    icon: 'menu-dots-circle-line-duotone',
    bgcolor: "error",
    href: "/forms/form-custom",
  },
  {
    id: uniqueId(),
    title: "Form Wizard",
    icon: 'recive-twice-square-line-duotone',
    bgcolor: "info",
    href: "/forms/form-wizard",
  },
  {
    id: uniqueId(),
    title: "Form Validation",
    icon: 'shield-warning-line-duotone',
    href: "/forms/form-validation",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "Quill Editor",
    icon: 'gallery-edit-line-duotone',
    bgcolor: "secondary",
    href: "/forms/form-quill",
  },
  {
    navlabel: true,
    subheader: "Tables",
  },
  {
    id: uniqueId(),
    title: "Basic",
    icon: 'tablet-line-duotone',
    bgcolor: "success",
    href: "/tables/basic",
  },
  {
    id: uniqueId(),
    title: "Collapsible",
    icon: 'colour-tuneing-line-duotone',
    bgcolor: "warning",
    href: "/tables/collapsible",
  },
  {
    id: uniqueId(),
    title: "Enhanced",
    icon: 'airbuds-case-minimalistic-line-duotone',
    bgcolor: "error",
    href: "/tables/enhanced",
  },
  {
    id: uniqueId(),
    title: "Fixed Header",
    icon: 'list-check-bold-duotone',
    bgcolor: "info",
    href: "/tables/fixed-header",
  },
  {
    id: uniqueId(),
    title: "Pagination",
    icon: 'flip-vertical-line-duotone',
    href: "/tables/pagination",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "Search",
    icon: 'card-search-line-duotone',
    bgcolor: "secondary",
    href: "/tables/search",
  },
  {
    navlabel: true,
    subheader: "UI",
  },
  {
    id: uniqueId(),
    title: "Ui Components",
    icon: 'code-scan-line-duotone',
    bgcolor: "warning",
    href: "/ui-components/alert",
    children: [
      {
        id: uniqueId(),
        title: "Alert",
        href: "/ui-components/alert",
      },
      {
        id: uniqueId(),
        title: "Accordion",
        href: "/ui-components/accordion",
      },
      {
        id: uniqueId(),
        title: "Avatar",
        href: "/ui-components/avatar",
      },
      {
        id: uniqueId(),
        title: "Chip",
        href: "/ui-components/chip",
      },
      {
        id: uniqueId(),
        title: "Dialog",
        href: "/ui-components/dialog",
      },
      {
        id: uniqueId(),
        title: "List",
        href: "/ui-components/list",
      },
      {
        id: uniqueId(),
        title: "Popover",
        href: "/ui-components/popover",
      },
      {
        id: uniqueId(),
        title: "Rating",
        href: "/ui-components/rating",
      },
      {
        id: uniqueId(),
        title: "Tabs",
        href: "/ui-components/tabs",
      },
      {
        id: uniqueId(),
        title: "Tooltip",
        href: "/ui-components/tooltip",
      },
      {
        id: uniqueId(),
        title: "Transfer List",
        href: "/ui-components/transfer-list",
      },
      {
        id: uniqueId(),
        title: "Typography",
        href: "/ui-components/typography",
      },
    ],
  },

  {
    navlabel: true,
    subheader: "Charts",
  },
  {
    id: uniqueId(),
    title: "Line",
    icon: 'align-right-line-duotone',
    bgcolor: "error",
    href: "/charts/line",
  },
  {
    id: uniqueId(),
    title: "Gradient",
    icon: 'pie-chart-line-duotone',
    bgcolor: "info",
    href: "/charts/gradient",
  },
  {
    id: uniqueId(),
    title: "Area",
    icon: 'chart-square-line-duotone',
    href: "/charts/area",
    bgcolor: "primary",
  },
  {
    id: uniqueId(),
    title: "Candlestick",
    icon: 'align-top-line-duotone',
    bgcolor: "secondary",
    href: "/charts/candlestick",
  },
  {
    id: uniqueId(),
    title: "Column",
    icon: 'align-left-line-duotone',
    bgcolor: "warning",
    href: "/charts/column",
  },
  {
    id: uniqueId(),
    title: "Doughtnut & Pie",
    icon: 'pie-chart-3-bold-duotone',
    bgcolor: "error",
    href: "/charts/doughnut",
  },
  {
    id: uniqueId(),
    title: "RadialBar & Radar",
    icon: 'asteroid-line-duotone',
    bgcolor: "info",
    href: "/charts/radialbar",
  },
  {
    navlabel: true,
    subheader: "Auth",
  },

  {
    id: uniqueId(),
    title: "Login",
    icon: 'login-2-line-duotone',
    href: "/auth/auth1/login",
    bgcolor: "primary",
    children: [
      {
        id: uniqueId(),
        title: "Side Login",
        href: "/auth/auth1/login",
      },
      {
        id: uniqueId(),
        title: "Boxed Login",
        href: "/auth/auth2/login",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Register",
    icon: 'user-plus-line-duotone',
    bgcolor: "secondary",
    href: "/auth/auth1/register",
    children: [
      {
        id: uniqueId(),
        title: "Side Register",
        href: "/auth/auth1/register",
      },
      {
        id: uniqueId(),
        title: "Boxed Register",
        href: "/auth/auth2/register",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Forgot Password",
    icon: 'forbidden-line-duotone',
    bgcolor: "success",
    href: "/auth/auth1/forgot-password",
    children: [
      {
        id: uniqueId(),
        title: "Side Forgot Password",
        href: "/auth/auth1/forgot-password",
      },
      {
        id: uniqueId(),
        title: "Boxed Forgot Password",
        href: "/auth/auth2/forgot-password",
      },
    ],
  },

  {
    id: uniqueId(),
    title: "Two Steps",
    icon: 'users-group-two-rounded-line-duotone',
    bgcolor: "warning",
    href: "/auth/auth1/two-steps",
    children: [
      {
        id: uniqueId(),
        title: "Side Two Steps",
        href: "/auth/auth1/two-steps",
      },
      {
        id: uniqueId(),
        title: "Boxed Two Steps",
        href: "/auth/auth2/two-steps",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Error",
    icon: 'bug-line-duotone',
    bgcolor: "error",
    href: "/auth/error",
  },
  {
    id: uniqueId(),
    title: "Maintenance",
    icon: 'settings-line-duotone',
    bgcolor: "info",
    href: "/auth/maintenance",
  },

  {
    navlabel: true,
    subheader: "Other",
  },
  {
    id: uniqueId(),
    title: "Menu Level",
    icon: 'double-alt-arrow-down-bold-duotone',
    href: "/menulevel/",
    bgcolor: "primary",
    children: [
      {
        id: uniqueId(),
        title: "Level 1",
        href: "/l1",
      },
      {
        id: uniqueId(),
        title: "Level 1.1",
        href: "/l1.1",
        children: [
          {
            id: uniqueId(),
            title: "Level 2",
            href: "/l2",
          },
          {
            id: uniqueId(),
            title: "Level 2.1",
            href: "/l2.1",
            children: [
              {
                id: uniqueId(),
                title: "Level 3",
                href: "/l3",
              },
              {
                id: uniqueId(),
                title: "Level 3.1",
                href: "/l3.1",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Disabled",
    icon: 'forbidden-circle-line-duotone',
    bgcolor: "secondary",
    href: "",
    disabled: true,
  },
  {
    id: uniqueId(),
    title: "SubCaption",
    subtitle: "This is the sutitle",
    icon: 'square-academic-cap-line-duotone',
    bgcolor: "warning",
    href: "",
  },

  {
    id: uniqueId(),
    title: "Chip",
    icon: 'archive-check-line-duotone',
    bgcolor: "error",
    href: "",
    chip: "9",
    chipColor: "error",
  },
  {
    id: uniqueId(),
    title: "Outlined",
    icon: 'smile-circle-line-duotone',
    bgcolor: "info",
    href: "",
    chip: "outline",
    variant: "outlined",
    chipColor: "info",
  },
  {
    id: uniqueId(),
    title: "External Link",
    external: true,
    icon: 'link-bold-duotone',
    bgcolor: "primary",
    href: "https://google.com",
  },
];

export default Menuitems;
