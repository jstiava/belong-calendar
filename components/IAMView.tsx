'use client';
import {
    Button,
    useTheme,
    Typography,
    Chip,
    Avatar,
} from '@mui/material';
import {
    PersonAddOutlined,
    BadgeOutlined,
    Google,
    GroupWorkOutlined,
    PersonOutline,
    WorkspacesOutlined,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import {
    GridColDef,
    GridRenderCellParams,
    DataGrid,
    useGridApiRef,
    GridComparatorFn,
} from '@mui/x-data-grid';

import { AppPageProps, getIntegrationIcon, Mode, Type } from '@/types/globals';

import useIAM, { UseIAM } from '@/lib/global/useIAM';
import { Group, Member, dayjs, Dayjs } from '@jstiava/chronos';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
import { PortraitImage } from '@/components/Image';
import useInviteMembers from '@/lib/useInviteMembers';
import axiosInstance from '@/lib/utils/axios';
import { UseBase } from '@/lib/global/useBase';
import { UseSession } from '@/lib/global/useSession';

export default function IAMView(props: {
    Session: UseSession,
    Base: UseBase,
    item: Member,
    IAM: UseIAM
}) {

    const IAM = props.IAM;

    const apiRef = useGridApiRef();
    const theme = useTheme();
    const router = useRouter();

    const InviteMembers = useInviteMembers(IAM);

    const alphaComparator: GridComparatorFn<string> = (v1, v2) => {
        if (v1 < v2) return -1;
        if (v1 > v2) return 1;
        return 0;
    };

    const nameAlphaComparator: GridComparatorFn<any> = (v1, v2, cellParams1, cellParams2) => {
        return alphaComparator(
            `${v1.name} (${v1.username})`,
            `${v2.name} (${v2.username})`,
            cellParams1,
            cellParams2,
        );
    };


    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            width: 300,
            sortComparator: nameAlphaComparator,
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
                        <Avatar
                            sx={{
                                width: "2rem",
                                height: "2rem",
                                backgroundColor: params.row.theme_color || theme.palette.primary.main,
                                color: params.row.theme_color ? theme.palette.getContrastText(params.row.theme_color) : theme.palette.primary.contrastText,
                                border: `2px solid ${params.row.theme_color || theme.palette.primary.main}`,
                            }}
                            alt={params.row.name || ''}
                            src={params.row instanceof Group && params.row.integration ? getIntegrationIcon(params.row.integration) || '' : `${MEDIA_BASE_URI}/${params.row.getIconPath()}`}
                        >{params.row.integration === 'google' ? (
                            <Google fontSize="small" />
                        ) : (
                            <>
                                {params.row.type === Type.Group && <WorkspacesOutlined sx={{
                                    fontSize: '1rem'
                                }} />}
                                {params.row.type === Type.Profile && <PersonOutline sx={{
                                    fontSize: '1rem'
                                }} />}
                            </>
                        )}</Avatar>
                        <div className="column snug fit" style={{
                            width: 'calc(100% - 3rem)'
                        }}>
                            <Typography> {params.value.name} <span style={{ opacity: 0.5 }}>({params.value.username})</span></Typography>
                        </div>
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
        // {
        //     field: 'joined_on',
        //     headerName: 'Joined On',
        //     width: 300,
        //     valueGetter: (value, row: Member) => {
        //         const junction = row.junctions.get(props.item.id());
        //         if (!junction) {
        //             return null;
        //         }
        //         return dayjs(junction.created_on);
        //     },
        //     renderCell: (params: GridRenderCellParams<any, Dayjs>) => {
        //         if (!params.value) return <span></span>;
        //         return <span>{params.value.format('MMMM DD, YYYY - h:mm A')}</span>;
        //     },
        // },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            valueGetter: (value, row) => {
                const junction = row.junctions.get(props.item.id());
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
            headerName: 'Wild Card',
            width: 150,
            valueGetter: (value, row) => {
                const junction = row.junctions.get(props.item.id());
                if (!junction) {
                    return null;
                }
                return junction.certificate_wild_card;
            },
            renderCell: (params: GridRenderCellParams<any, string>) => {
                if (params.value) {
                    return (
                        <Chip
                            label={"Full Access"}
                        />
                    )
                }
                return (
                    <Chip
                        color="error"
                        label={"No Access"}
                    />
                )
            },
        },
        {
            field: 'certificate_id',
            headerName: 'Certificate',
            width: 200,
            valueGetter: (value, row) => {
                const junction = row.junctions.get(props.item.id());
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


    const testStravaImport = async () => {

        if (!props.item) {
            return;
        }

        try {
            await axiosInstance.get('/api/v1/auth/strava/test')
                .then(res => {
                    console.log(res)
                })
                .catch(err => {
                    console.log(err);
                })

        } catch (error) {
            console.log(error);
        }
    }


    if (!props.item || !props.Session.session) {
        return null;
    }


    return (
        <>
            {InviteMembers.Modal}
            <div id="content" style={{ color: theme.palette.text.primary, paddingTop: "5rem" }}>
                <div className="column compact">
                    <div className="flex compact" style={{
                        padding: "0 1rem"
                    }}>
                        <Button
                        variant="contained"
                            startIcon={<PersonAddOutlined />}
                            onClick={() => {
                                props.Base.Creator.startCreator(Type.Profile, Mode.Create, null, {
                                    callback: (x: any) => IAM.register(x)
                                })
                                return;
                            }}
                        >Invite</Button>
                        {/* <Button
                            startIcon={<BadgeOutlined />}
                            onClick={() => {
                                props.Base.Creator.startCreator(Type.Certificate, Mode.Create, null, {
                                    callback: (x: any) => {
                                        return;
                                    }
                                })
                            }}
                        >
                            New Certificate
                        </Button> */}
                    </div>
                    <DataGrid
                        apiRef={apiRef}
                        getRowId={row => {
                            return row.uuid;
                        }}
                        rows={IAM.members || []}
                        columns={columns}
                        sx={{ height: "100%", '--DataGrid-overlayHeight': '300px' }}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 50 },
                            },
                        }}
                        getRowHeight={() => {
                            return 45;
                        }}
                        disableDensitySelector
                        disableColumnSelector
                        pageSizeOptions={[50, 100]}
                        checkboxSelection
                        // slots={{
                        //     toolbar: () => (
                        //         <CustomToolbar
                        //             selected={rowSelectionModel}
                        //         />
                        //     ),
                        //     noRowsOverlay: CustomNoRowsOverlay,
                        // }}
                        // hideFooterPagination
                        // onRowSelectionModelChange={newRowSelectionModel => {
                        //     setRowSelectionModel(newRowSelectionModel);
                        // }}
                        // rowSelectionModel={rowSelectionModel}
                        hideFooter
                    />
                </div>

            </div>
        </>
    );
}