// project imports
import './DefaultColors';
import { Theme } from '@mui/material/styles';

const components: any = (theme: Theme) => {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          boxSizing: "border-box",
        },
        html: {
          height: "100%",
          width: "100%",
        },
        a: {
          textDecoration: "none",
        },
        body: {
          height: "100%",
          margin: 0,
          padding: 0,
        },
        "#root": {
          height: "100%",
        },
        "*[dir='rtl'] .welcome-bg": {
          transform: "scaleX(-1)",
        },
        "*[dir='rtl'] .welcome-bg2": {
          transform: "scaleX(-1)",
        },
        "*[dir='rtl'] .top-img": {
          transform: "scaleX(-1)",
        },
        ".border-none": {
          border: "0px",
          td: {
            border: "0px",
          },
        },
        ".btn-xs": {
          minWidth: "30px !important",
          width: "30px",
          height: "30px",
          borderRadius: "6px !important",
          padding: "0px !important",
        },
        ".hover-text-primary:hover .text-hover": {
          color: theme.palette.primary.main,
        },
        ".hoverCard:hover": {
          scale: "1.01",
          transition: " 0.1s ease-in",
        },
        ".signup-bg": {
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
        },
        ".MuiBox-root": {
          borderRadius: theme.shape.borderRadius,
        },
        ".MuiCardHeader-action": {
          alignSelf: "center !important",
        },
        ".emoji-picker-react .emoji-scroll-wrapper": {
          overflowX: "hidden",
        },
        ".scrollbar-container": {
          borderRight: "0 !important",
        },
        ".theme-timeline .MuiTimelineOppositeContent-root": {
          minWidth: "90px",
        },
        ".MuiAlert-root .MuiAlert-icon": {
          color: "inherit!important",
        },
        ".MuiTimelineConnector-root": {
          width: "1px !important",
        },
        " .simplebar-scrollbar:before": {
          background: `${theme.palette.grey[300]} !important`,
        },
        "@keyframes gradient": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: " 100% 50%",
          },
          "100% ": {
            backgroundPosition: " 0% 50%",
          },
        },
        "@keyframes heartbit": {
          "0%": {
            transform:  'scale(0)',
            opacity: "0",
          },
          "25%" :{
            transform: 'scale(0.1)',
            opacity: 0.1
          },
          "50%" : {
            transform: 'scale(0.5)',
            opacity: 0.3,
          },
          "75%" :{
            transform: 'scale(0.8)',
            opacity: 0.5,
          },
          "100%" :{
            transform: 'scale(1)',
            opacity: 0,
          }

        },
        "@keyframes slide": {
          "0%": {
            transform:  'translate3d(0px, 0px, 0px)',
          },
          "100%" :{
            transform: 'translate3d(-100%, 0px, 0px)',
          }
        },
        ".rounded-bars .apexcharts-bar-series.apexcharts-plot-series .apexcharts-series path":
          {
            clipPath: "inset(0 0 5% 0 round 20px)",
          },
        ".btn-rounded-circle-40": {
          minWidth: "40px !important",
          padding: "0 !important",
          height: "40px",
          borderRadius: "100%  !important",
        },
        ".text-truncate-2": {
          overflow: "hidden",
          display: "-webkit-box",
          maxHeight: "4rem",
          textOverflow: "ellipsis",
          whiteSpace: "normal",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        },
        ".welcome-bg": {
          position: "absolute",
          right: "0",
          bottom: "0",
        },
        ".welcome-bg2": {
          position: "absolute",
          right: "-15px",
          bottom: "0",
        },
        ".dxm-background": {
          strokeWidth: "0",
        },
        ".dxm-control-bar": {
          display: "none",
        },
        ".top-img": {
          position: "absolute",  
          right: 0,
          top: 0,
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          ':before': {
            backgroundColor: theme.palette.grey[100],
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderColor: theme.palette.divider,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
        sizeSmall: {
          width: 30,
          height: 30,
          minHeight: 30,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          borderRadius: "25px" 
        },
        text: {
          padding: '5px 15px',
        },
        textPrimary: {
          backgroundColor: theme.palette.primary.light,
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: 'white',
          },
        },
        textSecondary: {
          backgroundColor: theme.palette.secondary.light,
          '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            color: 'white',
          },
        },
        textSuccess: {
          backgroundColor: theme.palette.success.light,
          '&:hover': {
            backgroundColor: theme.palette.success.main,
            color: 'white',
          },
        },
        textError: {
          backgroundColor: theme.palette.error.light,
          '&:hover': {
            backgroundColor: theme.palette.error.main,
            color: 'white',
          },
        },
        textInfo: {
          backgroundColor: theme.palette.info.light,
          '&:hover': {
            backgroundColor: theme.palette.info.main,
            color: 'white',
          },
        },
        textWarning: {
          backgroundColor: theme.palette.warning.light,
          '&:hover': {
            backgroundColor: theme.palette.warning.main,
            color: 'white',
          },
        },
        outlinedPrimary: {
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: 'white',
          },
        },
        outlinedSecondary: {
          '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            color: 'white',
          },
        },
        outlinedError: {
          '&:hover': {
            backgroundColor: theme.palette.error.main,
            color: 'white',
          },
        },
        outlinedSuccess: {
          '&:hover': {
            backgroundColor: theme.palette.success.main,
            color: 'white',
          },
        },
        outlinedInfo: {
          '&:hover': {
            backgroundColor: theme.palette.info.main,
            color: 'white',
          },
        },
        outlinedWarning: {
          '&:hover': {
            backgroundColor: theme.palette.warning.main,
            color: 'white',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
        title: {
          fontSize: '1.125rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          width: "100%",
          padding: "30px",
          backgroundImage: "none",
          borderRadius: "18px"
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '30px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiGridItem: {
      styleOverrides: {
        root: {
          paddingTop: '30px',
          paddingLeft: '30px !important',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.grey[200],
          borderRadius: '6px',
        },
      },
    },
    MuiTimelineConnector: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.divider,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: theme.palette.divider,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        filledSuccess: {
          color: 'white',
        },
        filledInfo: {
          color: 'white',
        },
        filledError: {
          color: 'white',
        },
        filledWarning: {
          color: 'white',
        },
        standardSuccess: {
          backgroundColor: theme.palette.success.light,
          color: theme.palette.success.main,
        },
        standardError: {
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.main,
        },
        standardWarning: {
          backgroundColor: theme.palette.warning.light,
          color: theme.palette.warning.main,
        },
        standardInfo: {
          backgroundColor: theme.palette.info.light,
          color: theme.palette.info.main,
        },
        outlinedSuccess: {
          borderColor: theme.palette.success.main,
          color: theme.palette.success.main,
        },
        outlinedWarning: {
          borderColor: theme.palette.warning.main,
          color: theme.palette.warning.main,
        },
        outlinedError: {
          borderColor: theme.palette.error.main,
          color: theme.palette.error.main,
        },
        outlinedInfo: {
          borderColor: theme.palette.info.main,
          color: theme.palette.info.main,
        },
        successIcon: {
          color: theme.palette.info.main,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor:
              theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[300],
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[300],
          },
        },
        input: {
          padding: '12px 14px',
        },
        inputSizeSmall: {
          padding: '8px 14px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: theme.palette.background.paper,
          background: theme.palette.text.primary,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderColor: `${theme.palette.divider}`,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: 'rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px'
        },
      },
    },
  };
};
export default components;
