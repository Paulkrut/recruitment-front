import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

// mui imports
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';
import { useSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { AppState } from "@/store/store";

type NavGroup = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
  children?: NavGroup[];
  chip?: string;
  chipColor?: any;
  variant?: string | any;
  external?: boolean;
  level?: number;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: any;
  level?: number | any;
  pathDirect: string;
}

export default function NavItem({
  item,
  level,
  pathDirect,
  hideMenu,
  onClick,
}: ItemType) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const { t } = useTranslation();

  const ListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: "nowrap",
    marginBottom: "2px",
    padding: "5px 10px 5px 0",
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor: level > 1 ? "transparent !important" : "inherit",
    color:
      level > 1 && pathDirect === item?.href
        ? `${theme.palette.primary.main}!important`
        : theme.palette.text.secondary,
    fontWeight:
      level > 1 && pathDirect === item?.href ? "600 !important" : "400",
    paddingLeft: hideMenu
      ? "0"
      : level > 2
      ? `${level * 15}px`
      : level > 1
      ? "10px"
      : "0",
    "&:before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "-20px",
      height: "100%",
      zIndex: "-1",
      borderRadius: " 0 24px 24px 0",
      transition: "all .3s ease-in-out",
      width: "0",
    },
    "&:hover::before": {
      width: "calc(100% + 20px)",
      backgroundColor: theme.palette.primary.light,
    },
    "& > .MuiListItemIcon-root": {
      width: 45,
      height: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      marginRight: "8px",
      transition: "all .3s ease-in-out",
    },
    "&:hover": {
      backgroundColor: "transparent !important",
    },
    "&.Mui-selected": {
     backgroundColor: "transparent !important",
      ".MuiListItemIcon-root": {
        color: theme.palette.primary.main,
      },
      "&:before": {
        backgroundColor: theme.palette.primary.light,
        width: "calc(100% + 16px)",
      },
      "&:hover": {
        color: theme.palette.text.primary,
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
    <List component="li" disablePadding key={item?.id && item.title}>
      <Link href={item.href}>
        <ListItemStyled
          disabled={item?.disabled}
          selected={pathDirect === item?.href}
          onClick={lgDown ? onClick : undefined}
          sx={{
            "&:hover": {
              ".MuiListItemIcon-root": {
                color: item.bgcolor + ".main",
              },
            },
            "&:hover::before": {
              backgroundColor: item.bgcolor + ".light",
            },
            "&.Mui-selected": {
              color:
                level > 1
                  ? `${theme.palette.text.secondary} !important`
                  : item.bgcolor + ".main",
              "& .MuiTypography-root": {
                fontWeight: level > 1 ? "600 !important" : 400,
              },
              ".MuiListItemIcon-root": {
                color: item.bgcolor + ".main",
              },
              "&:before": {
                backgroundColor: item.bgcolor + ".light",
              },
              "&:hover": {
                color: item.bgcolor + ".main",
                ".MuiListItemIcon-root": {
                  color: item.bgcolor + ".main",
                },
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: "36px",
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
          <ListItemText>
            {hideMenu ? "" : <>{t(`${item?.title}`)}</>}
            <br />
            {item?.subtitle ? (
              <Typography variant="caption">
                {hideMenu ? "" : item?.subtitle}
              </Typography>
            ) : (
              ""
            )}
          </ListItemText>

          {!item?.chip || hideMenu ? null : (
            <Chip
              color={item?.chipColor}
              variant={item?.variant ? item?.variant : "filled"}
              size="small"
              label={item?.chip}
            />
          )}
        </ListItemStyled>
      </Link>
    </List>
  );
}
