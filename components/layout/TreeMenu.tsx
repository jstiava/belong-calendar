import {
  ExpandMore,
  LocationOn,
  LocationOnOutlined,
  Public,
  ReceiptLong,
  Send,
  VerifiedUser,
  Inbox as InboxIcon,
  Drafts as DraftsIcon,
  Search,
  CalendarMonthOutlined,
  HomeOutlined as HomeIcon,
  EventOutlined,
  StorefrontOutlined,
  PersonOutlined,
  SettingsOutlined,
  NewspaperOutlined,
  Mail,
  PivotTableChart,
} from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Box from '@mui/material/Box';
import { styled, useTheme, alpha, lighten } from '@mui/material/styles';
import { SvgIconProps } from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Root,
  TreeItem2GroupTransition,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import {
  unstable_useTreeItem2 as useTreeItem,
  UseTreeItem2Parameters,
} from '@mui/x-tree-view/useTreeItem2';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { UseBase } from '@/lib/global/useBase';
import { UseSession } from '@/lib/global/useSession';
import { UseSocket } from '@/lib/global/useSocket';
import { useMediaQuery } from '@mui/material';

const MEDIA_BASE_URI = "https://mozi-belong-media-public-demo.s3.us-east-2.amazonaws.com";


const CustomTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '& .MuiBox-root': {
    alignItems: "flex-start",
  },
  '& .MuiSvgIcon-root': {
    width: "1.2rem",
    height: "1.2rem"
  }
}));

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  marginBottom: theme.spacing(0.3),
  color: theme.palette.text.secondary,
  borderRadius: theme.spacing(0.5),
  paddingRight: '0',
  fontWeight: theme.typography.fontWeightMedium,
  '&.expanded': {
    fontWeight: theme.typography.fontWeightRegular,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.focused, &.selected, &.selected.focused': {
    backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
    color: 'var(--tree-view-color)',
  },
}));

const CustomTreeItemIconContainer = styled(TreeItem2IconContainer)(({ theme }) => ({
  marginRight: theme.spacing(0),
}));

const CustomTreeItemGroupTransition = styled(TreeItem2GroupTransition)(({ theme }) => ({
  marginLeft: 0,
  [`& .content`]: {
    paddingLeft: theme.spacing(2),
  },
}));

export const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: StyledTreeItemProps & {
    minified?: boolean
  },
  ref: React.Ref<HTMLLIElement>,
) {
  const theme = useTheme();
  const {
    id,
    itemId,
    label,
    disabled,
    children,
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelInfo,
    colorForDarkMode,
    bgColorForDarkMode,
    minified,
    ...other
  } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref });

  const style = {
    '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
    '--tree-view-bg-color': theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
  };

  const isSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TreeItem2Provider itemId={itemId}>
      <CustomTreeItemRoot {...getRootProps({ ...other, style })}>
        <CustomTreeItemContent
          {...getContentProps({
            className: clsx('content', {
              expanded: status.expanded,
              selected: status.selected,
              focused: status.focused,
            }),
          })}
          sx={{
            padding: '0.25rem 0',
            width: "100%",
            justifyContent: minified && !isSM ? 'center' : 'flex-start',
            gap: 0
          }}
        >
          {/* <CustomTreeItemIconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} /> 
          </CustomTreeItemIconContainer> */}
          <Box
            sx={{
              display: 'flex',
              flexGrow: 0,
              alignItems: 'center',
              p: 0.5,
              pl: minified && !isSM ? 0 : '1rem'
              // pr: 0,
              // ml: -1,
            }}
          >
            <Box component={LabelIcon} color="inherit" sx={{ mr: minified && !isSM ? 0 : 1 }} />
            {(!minified || isSM) && (
              <>
                <Typography
                  {...getLabelProps({
                    variant: 'body2',
                    sx: { display: 'flex', fontWeight: 'inherit', flexGrow: 1 },
                  })}
                />
                <Typography variant="caption" color="inherit">
                  {labelInfo}
                </Typography>
              </>
            )}
          </Box>
        </CustomTreeItemContent>
        {children && <CustomTreeItemGroupTransition {...getGroupTransitionProps()} />}
      </CustomTreeItemRoot>
    </TreeItem2Provider>
  );
});




export default function GmailTreeView({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const theme = useTheme();
  const [selectedItems, setSelectedItems] = useState<string>(null);
  const isSM = useMediaQuery(theme.breakpoints.down('sm'));



  useEffect(() => {
    console.log(router.query);
    const parts = router.pathname.split('/');
    console.log(parts);
    if (parts[1] === 'be') {
      if (parts.length === 3) {
        setSelectedItems("calendar");
        return;
      }
      setSelectedItems(parts[3]);
      return;
    }

    if (parts[1] === 'at') {
      setSelectedItems(String(router.query.location))
      return;
    }
    setSelectedItems(parts[parts.length - 1]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);


  const handleSelectedItemsChange = (
    event: React.SyntheticEvent<Element, Event>,
    ids: string[] | null,
  ) => {

    if (!ids) return;
    setSelectedItems(ids[0]);
  };


  return (
    <SimpleTreeView
      aria-label="gmail"
      expandedItems={[selectedItems]}
      selectedItems={[selectedItems]}
      onSelectedItemsChange={handleSelectedItemsChange}
      slots={{
        expandIcon: ArrowRightIcon,
        collapseIcon: ArrowDropDownIcon,
        endIcon: EndIcon,
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: 'fit-content',
        marginBottom: isSM ? '8px' : ''
      }}
    >
      {children}
    </SimpleTreeView>
  );
}

declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

interface StyledTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
  React.HTMLAttributes<HTMLLIElement> {
  bgColor?: string;
  bgColorForDarkMode?: string;
  color?: string;
  colorForDarkMode?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  labelInfo?: string;
}


function EndIcon() {
  return <div style={{ width: 24 }} />;
}
