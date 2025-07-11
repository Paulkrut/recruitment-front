import React from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import { usePathname } from "next/navigation";

// mui imports
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import { useSelector } from '@/store/hooks';

// custom imports
import NavItem from '../NavItem';

// plugins
import { IconChevronDown } from '@tabler/icons-react';
import { AppState } from '@/store/store';

type NavGroupProps = {
  [x: string]: any;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
};

interface NavCollapseProps {
  menu: NavGroupProps;
  level: number;
  pathWithoutLastPart: any;
  pathDirect: any;
  hideMenu: any;
  onClick: any;
}

// FC Component For Dropdown Menu
const NavCollapse = ({ menu, level, pathWithoutLastPart, pathDirect, hideMenu, onClick }: NavCollapseProps) => {

  const theme = useTheme();
  const  pathname  = usePathname();
  const [open, setOpen] = React.useState(false);
  const customizer = useSelector((state: AppState) => state.customizer);

  React.useEffect(() => {
    setOpen(false);
    menu.children.forEach((item: any) => {
      if (item.href === pathname) {
        setOpen(true);
      }
    });
  }, [pathname, menu.children]);

  const ListItemStyled = styled(ListItemButton)(() => ({
    width: 'auto',
    padding: '5px 10px',
    position: 'relative',
    flexGrow: 'unset',
    gap: '10px',
    borderRadius: `${customizer.borderRadius}px`,
    whiteSpace: 'nowrap',
    color: open || pathname.includes(menu.href) || level < 1 ? menu.bgcolor + ".main" : theme.palette.text.secondary,
    "&:before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left:"-1px",
      height: "100%",
      zIndex: "-1",
      borderRadius: " 9px",
      transition: "all .3s ease-in-out",
      width: open && level < 2 ? "100%" : "0",
      backgroundColor: open && level < 2 ? theme.palette.primary.light : "",
    },
    "&:hover::before": {
      width: "100%",
      backgroundColor: theme.palette.primary.light,
    },
    '&:hover': {
      backgroundColor:
        open || pathname.includes(menu.href)
          ? theme.palette.primary.main
          : theme.palette.primary.light,
    },
    '&:hover > .SubNav': { display: 'block' },
  }));

  const ListSubMenu = styled(Box)(() => ({
    display: 'none',
    position: 'absolute',
    top: level > 1 ? `0px` : '35px',
    left: level > 1 ? `${level + 228}px` : '0px',
    padding: '10px',
    width: '250px',
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[8],
    backgroundColor: theme.palette.background.paper,
  }));

  const listItemProps: {
    component: string;
  } = {
    component: 'li',
  };

  // If Menu has Children
  const submenus = menu.children?.map((item: any) => {
    if (item.children) {
      return (
        <NavCollapse
          key={item.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          hideMenu={hideMenu} onClick={undefined}        />
      );
    } else {
      return (
        <NavItem
          key={item.id}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          hideMenu={hideMenu} onClick={onClick}        />
      );
    }
  });

  return (
    <React.Fragment key={menu.id}>
      <ListItemStyled
        {...listItemProps}
        selected={pathWithoutLastPart === menu.href}
        className={open ? 'selected' : ''}
        sx={{
          "&:hover": {
            backgroundColor: "transparent",
            ".MuiListItemIcon-root": {
              color: level < 2 ? menu.bgcolor + ".main" : "",
            },
          },
          "&:hover::before": {
            backgroundColor: menu.bgcolor + ".light",
          },

          "&:before": {
            backgroundColor: open && level < 2 ? menu.bgcolor + ".light" : "",
          },

          color:
            open && level < 2
              ? menu.bgcolor + ".main"
              : `inherit` && level > 1 && open
              ? menu.bgcolor + ".main"
              : `inherit`,
          ".MuiListItemIcon-root": {
            color: open && level < 2 ? menu.bgcolor + ".main" : "",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: "auto",
            p: "3px 0",
            color: "inherit",
          }}
        >
          {level < 2 ? (
            <Icon icon={"solar:" + menu.icon} width="24" height="24" />
          ) : (
            <Box
                sx={{
                  width: "6px",
                  height: "6px",
                  opacity: level > 1 && pathWithoutLastPart === menu.href ? 1 :  "0.3",
                  backgroundColor:
                    level > 1 && pathWithoutLastPart === menu.href
                      ? `${theme.palette.primary.main}!important`
                      : theme.palette.text.secondary,
                }}
              />
          )}
        </ListItemIcon>
        <ListItemText color="inherit" sx={{ mr: 'auto' }}>
          {menu.title}
        </ListItemText>
        <IconChevronDown size="1rem" />
        <ListSubMenu component={'ul'} className="SubNav">
          {submenus}
        </ListSubMenu>
      </ListItemStyled>
    </React.Fragment>
  );
};

export default NavCollapse;
