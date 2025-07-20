import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

// mui imports
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled, useTheme } from '@mui/material/styles';
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

type NavGroup = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: NavGroup[];
  chip?: string;
  chipColor?: any;
  variant?: string | any;
  external?: boolean;
  level?: number;
};

interface ItemType {
  item: NavGroup;
  onClick: React.MouseEventHandler<HTMLElement>;
  hideMenu: any;
  level?: number | any;
  pathDirect: string;
}

const NavItem = ({ item, level, pathDirect, onClick }: ItemType) => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const ListItemStyled2 = styled(ListItemButton)(() => ({
    padding: "5px 10px",
    gap: "10px",
    borderRadius: `${customizer.borderRadius}px`,
    marginBottom: level > 1 ? "3px" : "0px",
    color:
      level > 1 && pathDirect === item.href
        ? `${theme.palette.primary.main}!important`
        : theme.palette.text.secondary,

    "&:hover": {
      backgroundColor: theme.palette.primary.light,
    },
    "&.Mui-selected": {
      color:
        level > 1
          ? `${theme.palette.text.secondary} !important`
          : item.bgcolor + ".main",
      "& .MuiTypography-root": {
        fontWeight: level > 1 ? "600 !important" : 400,
      },
      backgroundColor: level > 1 ? "transparent" : theme.palette.primary.main,
      "&:hover": {
        backgroundColor: level > 1 ? "" : theme.palette.primary.main,
        color: "white",
      },
    },
  }));

  const listItemProps: {
    component: any;
    href?: string;
    target?: any;
    to?: any;
  } = {
    component: item?.external ? "a" : Link,
    to: item?.href,
    href: item?.external ? item?.href : "",
    target: item?.external ? "_blank" : "",
  };
  return (
    <List component="li" disablePadding key={item.id}>
      <Link href={`${item?.href}`}>
        <ListItemStyled2
          disabled={item?.disabled}
          selected={pathDirect === item?.href}
          onClick={onClick}
        >

          <ListItemIcon
            sx={{
              minWidth: "auto",
              p: "3px 0",
              color:
                level > 1 && pathDirect === item?.href
                  ? `${theme.palette.primary.main}!important`
                  : "inherit",
            }}
          >
            {level > 1 ? (
              <Box
                sx={{
                  width: "6px",
                  height: "6px",
                  opacity: level > 1 && pathDirect === item?.href ? 1 : "0.3",
                  backgroundColor:
                    level > 1 && pathDirect === item?.href
                      ? theme.palette.text.secondary
                      : theme.palette.text.secondary,
                }}
              />
            ) : (
              <Icon icon={"solar:" + item.icon} width="24" height="24" />
            )}
          </ListItemIcon>
          <ListItemText>{item.title}</ListItemText>
        </ListItemStyled2>
      </Link>
    </List>
  );
};

export default NavItem;
