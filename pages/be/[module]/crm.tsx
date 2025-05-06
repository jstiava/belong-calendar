'use client';
import { AppPageProps } from '@/types/globals';
import { useRouter } from 'next/router';
import { Box, Button, Checkbox, Chip, styled, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Group, Member } from '@/schema';
import ItemStub from '@/components/ItemStub';
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid';
import dayjs from '@/lib/utils/dayjs';
import { Dayjs } from 'dayjs';
import { useState } from 'react';
import Divider, { DIVIDER_NO_ALPHA_COLOR } from '@/components/Divider';
import StyledIconButton from '@/components/StyledIconButton';
import { CloseOutlined } from '@mui/icons-material';

const CustomCheckbox = (props: any) => (
    <Checkbox
        {...props}
        size="small"
    />
);

const PREVIEW_SIZE = '30rem';

const MainBasePage = (props: AppPageProps) => {
    const router = useRouter();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const [isPreviewOpen, setIsPreviewOpen] = useState(true);

    const apiRef = useGridApiRef();

    const item = props.module ? props.module : props.Session.base;
    const IAM = props.module ? props.Module.IAM : props.Base.IAM;

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            width: 300,
            // sortComparator: nameAlphaComparator,
            valueGetter: (value, row) => {
                return {
                    uuid: row.uuid,
                    name: row.name,
                    username: row.username,
                };
            },
            renderCell: (params: GridRenderCellParams<Member, any>) => {
                const prefix = params.row instanceof Group ? 'be' : params.row instanceof Event ? 'event' : null;
                return (
                    <div className='flex compact left middle' style={{ position: 'relative', height: '100%' }}>
                        <ItemStub
                            item={params.row}
                        />
                        <div className="flex fit" style={{
                            position: "absolute",
                            right: 0
                        }}>
                            {/* {props.Session.session && props.Session.session.username === params.value.username && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                        props.Session.handleLeave();
                                        router.push('/dashboard');
                                    }}
                                >
                                    Leave
                                </Button>
                            )} */}

                            {prefix && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                        router.push(`/${prefix}/${params.id}`);
                                    }}
                                    sx={{
                                        backgroundColor: theme.palette.background.paper
                                    }}
                                >
                                    Switch
                                </Button>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            field: 'joined_on',
            headerName: 'Joined On',
            width: 300,
            valueGetter: (value, row: Member) => {
                const junction = row.junctions.get(item.id());
                if (!junction) {
                    return null;
                }
                return dayjs(junction.created_on);
            },
            renderCell: (params: GridRenderCellParams<any, Dayjs>) => {
                if (!params.value) return <span></span>;
                return <span>{params.value.format('MMMM DD, YYYY - h:mm A')}</span>;
            },
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            valueGetter: (value, row) => {
                const junction = row.junctions.get(item.id());
                if (!junction) {
                    return null;
                }
                return junction.status;
            },
            // sortComparator: sortRolesComparator,
            renderCell: (params: GridRenderCellParams<any, string>) => {
                return <span style={{ textTransform: 'capitalize' }}>{params.value}</span>;
            },
        },
        {
            field: 'certificate_wild_card',
            headerName: 'Access',
            width: 150,
            valueGetter: (value, row) => {
                const junction = row.junctions.get(item.id());
                if (!junction) {
                    return null;
                }
                return junction.certificate_wild_card;
            },
            renderCell: (params: GridRenderCellParams<any, string>) => {
                if (params.value) {
                    return (
                        <Chip
                            label={"Admin"}
                        />
                    )
                }
                return (
                    <Chip
                        color="error"
                        label={"Denied"}
                    />
                )
            },
        },
        {
            field: 'certificate_id',
            headerName: 'Certificate',
            width: 200,
            valueGetter: (value, row) => {
                const junction = row.junctions.get(item.id());
                if (!junction) {
                    return null;
                }
                return junction.certificate_id;
            },
            // sortComparator: sortRolesComparator,
            renderCell: (params: GridRenderCellParams<any, string>) => {
                return <span style={{ textTransform: 'capitalize' }}>{params.value}</span>;
            },
        },
    ];

    return (
        <div className="flex snug top" style={{
            height: "100%"
        }}>
            <div className="column" style={{
                width: `calc(100% - ${isPreviewOpen ? PREVIEW_SIZE : '0rem'})`,
                height: "100%",
                borderTop: '1px solid transparent',
                borderRight: `0.05rem solid ${DIVIDER_NO_ALPHA_COLOR}`

            }}>
                <DataGrid
                    apiRef={apiRef}
                    loading={!IAM || !IAM.members}
                    getRowId={row => {
                        return row.id();
                    }}
                    rows={IAM.members!}
                    sx={{
                        minHeight: "calc(100% - 5rem) !important",
                        borderRadius: "0",
                        border: 0,
                    }}
                    columnHeaderHeight={48}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 50 },
                        },
                    }}
                    getRowHeight={() => {
                        return 40;
                    }}
                    disableDensitySelector
                    disableColumnSelector
                    pageSizeOptions={[50, 100]}
                    checkboxSelection
                    slots={{
                        baseCheckbox: CustomCheckbox,
                        noRowsOverlay: CustomNoRowsOverlay,
                    }}
                    slotProps={{
                        loadingOverlay: {
                            variant: 'skeleton',
                            noRowsVariant: 'skeleton',
                        },
                    }}
                // slots={{
                //     toolbar: () => (
                //         <CustomToolbar
                //             selected={rowSelectionModel}
                //         />
                //     ),
                //     
                // }}
                // hideFooterPagination
                // onRowSelectionModelChange={newRowSelectionModel => {
                //     setRowSelectionModel(newRowSelectionModel);
                // }}
                // rowSelectionModel={rowSelectionModel}
                // hideFooter
                />
            </div>
            <div className="column top" style={{
                position: 'relative',
                margin: '1.5rem',
                width: PREVIEW_SIZE,
                height: 'calc(100% - 2rem)',
            }}>
                <div className="column compact" style={{
                    position: 'relative'
                }}>
                    <Typography variant="h4">Jeremy Stiava</Typography>
                    <Typography>Profile</Typography>

                    <div style={{
                        position: 'absolute',
                        top: "-1rem",
                        right: "-1rem"
                    }}>
                        <StyledIconButton title="Close Preview" onClick={() => {
                            return;
                        }}>
                            <CloseOutlined sx={{
                                fontSize: "1rem"
                            }} />
                        </StyledIconButton>
                    </div>
                </div>

                <div className="column compact" style={{
                    position: 'absolute',
                    bottom: "1rem",
                    width: '100%',
                }}>
                    <Button
                        fullWidth
                        variant='contained'
                        size="large"
                    >Edit</Button>
                </div>
            </div>

        </div>
    );
}

const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .no-rows-primary': {
        fill: '#3D4751',
        ...theme.applyStyles('light', {
            fill: '#AEB8C2',
        }),
    },
    '& .no-rows-secondary': {
        fill: '#1D2126',
        ...theme.applyStyles('light', {
            fill: '#E8EAED',
        }),
    },
}));

function CustomNoRowsOverlay() {
    return (
        <StyledGridOverlay>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                width={96}
                viewBox="0 0 452 257"
                aria-hidden
                focusable="false"
            >
                <path
                    className="no-rows-primary"
                    d="M348 69c-46.392 0-84 37.608-84 84s37.608 84 84 84 84-37.608 84-84-37.608-84-84-84Zm-104 84c0-57.438 46.562-104 104-104s104 46.562 104 104-46.562 104-104 104-104-46.562-104-104Z"
                />
                <path
                    className="no-rows-primary"
                    d="M308.929 113.929c3.905-3.905 10.237-3.905 14.142 0l63.64 63.64c3.905 3.905 3.905 10.236 0 14.142-3.906 3.905-10.237 3.905-14.142 0l-63.64-63.64c-3.905-3.905-3.905-10.237 0-14.142Z"
                />
                <path
                    className="no-rows-primary"
                    d="M308.929 191.711c-3.905-3.906-3.905-10.237 0-14.142l63.64-63.64c3.905-3.905 10.236-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-63.64 63.64c-3.905 3.905-10.237 3.905-14.142 0Z"
                />
                <path
                    className="no-rows-secondary"
                    d="M0 10C0 4.477 4.477 0 10 0h380c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 20 0 15.523 0 10ZM0 59c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 69 0 64.523 0 59ZM0 106c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 153c0-5.523 4.477-10 10-10h195.5c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 200c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 247c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10Z"
                />
            </svg>
            <Box sx={{ mt: 2 }}>No rows</Box>
        </StyledGridOverlay>
    );
}


export default MainBasePage;
