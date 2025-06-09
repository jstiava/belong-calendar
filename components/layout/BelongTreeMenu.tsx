"use client"
import { StartCreator } from "@/lib/global/useCreate"
import { UseSession } from "@/lib/global/useSession"
import { Event, Member } from '@jstiava/chronos'
import EventSidebarCard from "../EventSidebarCard"
import { JSX, Ref, RefAttributes, forwardRef, useRef } from "react"
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { useTreeItem2, UseTreeItem2Parameters } from '@mui/x-tree-view/useTreeItem2';
import {
    TreeItem2Checkbox,
    TreeItem2Content,
    TreeItem2GroupTransition,
    TreeItem2IconContainer,
    TreeItem2Label,
    TreeItem2Root,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { alpha, Avatar, Box, styled, Typography, useTheme } from "@mui/material"
import { CalendarMonthOutlined, EventOutlined } from "@mui/icons-material"
import { PortraitImage } from "../Image"
import { MEDIA_BASE_URI } from "@/lib/useComplexFileDrop"
import { StartViewer } from "@/lib/global/useView"
import { Type } from "@/types/globals"

const isExpandable = (reactChildren: React.ReactNode) => {
    if (Array.isArray(reactChildren)) {
        return reactChildren.length > 0 && reactChildren.some(isExpandable);
    }
    return Boolean(reactChildren);
};

interface CustomTreeItemProps
    extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> { }

const CustomTreeItem = forwardRef(function CustomTreeItem(
    props: CustomTreeItemProps,
    ref: React.Ref<HTMLLIElement>,
) {

    const treeItemRef = useRef<HTMLDivElement | null>(null);
    const theme = useTheme();
    const { id, itemId, label, disabled, children, ...other } = props;

    const {
        getRootProps,
        getContentProps,
        getIconContainerProps,
        getCheckboxProps,
        getLabelProps,
        getGroupTransitionProps,
        getDragAndDropOverlayProps,
        status,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });


    const expandable = true;

    return (
        <TreeItem2Provider itemId={itemId}>
            <StyledTreeItemRoot {...getRootProps(other)}>
                <CustomTreeItemContent
                    {...getContentProps({
                        className: [
                            'content',
                            status.expanded ? 'Mui-expanded' : '',
                            status.selected ? 'Mui-selected' : '',
                            status.focused ? 'Mui-focused' : '',
                            status.disabled ? 'Mui-disabled' : ''
                        ].filter(Boolean).join(' ')
                    })}
                >
                    <TreeItem2IconContainer {...getIconContainerProps()}>
                        <TreeItem2Icon status={status} />
                    </TreeItem2IconContainer>
                    <TreeItem2Checkbox {...getCheckboxProps()} />
                    <TreeItem2Label
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            ref={treeItemRef}
                            sx={{
                                fontSize: "0.85rem",
                                width: "calc(100% - 40px)",
                                textAlign: "left",
                                display: "inline-block",
                                whiteSpace: "nowrap",
                                overflow: "clip",
                                textOverflow: "ellipsis"
                            }}>{label}</Typography>
                        <Typography variant="body2">{children}</Typography>
                        {expandable && <DotIcon />}
                    </TreeItem2Label>
                    {/* <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} /> */}
                </CustomTreeItemContent>
            </StyledTreeItemRoot>
        </TreeItem2Provider>
    );
});


const MenuItems = [
    {
        id: 'events',
        label: 'Events'
    },
    {
        id: 'locations',
        label: "Locations"
    },
    {
        id: 'iam',
        label: 'Identity & Access Management'
    }
]

export const BelongTreeMenu = forwardRef(function BelongTreeMenu(props: {
    source: Member,
    startCreator: StartCreator,
    Session: UseSession
}, ref: Ref<any>) {

    const { source, startCreator, Session, ...other } = props;

    return (
        <div className="column snug" style={{ position: "relative", width: "100%" }}>
            <RichTreeView
                defaultExpandedItems={['3']}
                items={MenuItems}
            />
            {/* {eventList && eventList.map((s: Event) => {
                return (
                    <EventSidebarCard id={s.id()} key={s.id()} event={s} startCreator={startCreator} startViewer={handleOpenEventPopover} base={Session.base} />
                )
            })} */}
        </div>
    )
})


const StyledTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
    color: theme.palette.grey[400],
    position: 'relative',
    [`& .${treeItemClasses.groupTransition}`]: {
        marginLeft: theme.spacing(3.5),
    },
    ...theme.applyStyles('light', {
        color: theme.palette.grey[800],
    }),
})) as unknown as typeof TreeItem2Root;


const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
    flexDirection: 'row-reverse',
    borderRadius: theme.spacing(0.7),
    margin: 0,
    padding: "0.05rem 0.5rem",
    fontWeight: 500,
    [`&.Mui-expanded `]: {
        '&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon': {
            color: theme.palette.primary.dark,
            ...theme.applyStyles('light', {
                color: theme.palette.primary.main,
            }),
        },
        '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: '16px',
            top: '44px',
            height: 'calc(100% - 48px)',
            width: '1.5px',
            backgroundColor: theme.palette.grey[700],
            ...theme.applyStyles('light', {
                backgroundColor: theme.palette.grey[300],
            }),
        },
    },
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: 'white',
        ...theme.applyStyles('light', {
            color: theme.palette.primary.main,
        }),
    },
    [`&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused`]: {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        ...theme.applyStyles('light', {
            backgroundColor: theme.palette.primary.main,
        }),
    },
}));


function DotIcon() {
    return (
        <Box
            sx={{
                width: 6,
                height: 6,
                borderRadius: '70%',
                bgcolor: 'warning.main',
                display: 'inline-block',
                verticalAlign: 'middle',
                zIndex: 1,
                mx: 1,
            }}
        />
    );
}