'use client';
import { useRouter } from 'next/router';
import { Mode, SessionProtectedAppPageProps, Type } from '@/types/globals';
import { Button, ButtonBase, Typography, useTheme, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { CSSProperties, useState } from 'react';
import { Group, Member } from '@/schema';
import ItemStub from '@/components/ItemStub';
import { AddOutlined, MoreHorizOutlined, PushPinOutlined, Search } from '@mui/icons-material';
import StyledIconButton from '@/components/StyledIconButton';


const MemberItemStub = ({
    item,
    onClick,
    style
}: {
    item: Member,
    onClick?: any,
    style?: CSSProperties
}) => {
    return (
        <ButtonBase
            disableRipple
            className="flex"
            style={{
                position: 'relative',
                width: "calc(33% - (1rem / 3))",
                marginBottom: "0.33rem",
                animation: `popIn 0.5s ease forwards`,
                transform: "scale(0)",
                opacity: 0,
                backgroundColor: `${item.theme_color}10`,
                padding: "0.75rem 1rem",
                borderRadius: "0.25rem",
                ...style
            }}
            onClick={onClick}
        >
            <ItemStub item={item}
             />
            <div className="flex fit" style={{
                position: 'absolute',
                right: '0.25rem',
                top: '0.25rem'
            }}>
                <StyledIconButton
                    title={"Pin"}
                    onClick={(e : any) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }}
                >
                    <PushPinOutlined sx={{
                        fontSize: '1rem',
                        // color: item.theme_color,
                        transform: 'rotate(45deg)'
                    }} />
                </StyledIconButton>
            </div>
        </ButtonBase>
    )
}

const ProfilePage = (props: SessionProtectedAppPageProps) => {
    const router = useRouter();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const Session = props.Session;
    const item = props.Session.session;
    const columns = 3;
    const delayStep = 100;

    const [searchedBases, setSearchedBases] = useState<Member[] | null>(Session.bases);

    if (!Session.session) {
        return <><Typography>Loading session page.</Typography></>
    }

    return (
        <div id="main"
            className="column"
            style={{
                padding: "2rem",
                maxWidth: "60rem"
            }}>
            <div className="flex between">
                <TextField
                    onChange={(e) => {
                        const query = e.target.value;
                        if (!query || query.length == 0) {
                            setSearchedBases(Session.bases);
                            return;
                        }
                        const result = Session.search(query);
                        setSearchedBases(result);
                    }}
                    placeholder="Search"
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <Search sx={{
                                fontSize: '1.25rem',
                                marginRight: "0.5rem"
                            }} />
                        )
                    }}
                />

                <div className="flex fit">
                    <div className="flex fit">
                        <Button
                            onClick={() => {
                                router.push({
                                    pathname: `/me/integrations`,
                                    query: { ...router.query, view: undefined }
                                })
                            }}
                            endIcon={<MoreHorizOutlined />}
                            sx={{
                                color: theme.palette.text.primary,
                                width: 'fit-content'
                            }}
                            className="flex between"
                        >
                            Integrate
                        </Button>
                    </div>
                    <Button
                        startIcon={<AddOutlined />}
                        variant="outlined"
                        onClick={() => {
                            Session.Creator.startCreator(Type.Group, Mode.Create, null, {
                                callback: (newItem: any) => Session.addNewBase(newItem)
                            });
                        }}
                    >New</Button>
                </div>
            </div>
            <div className="flex between">
                <div className="flex fit">

                </div>
            </div>
            <div className='flex compact top' style={{
                flexWrap: 'wrap',
                marginBottom: '5rem',
            }}>
                {searchedBases && searchedBases.map((m, index) => {

                    const row = Math.floor(index / columns);
                    const col = index % columns;

                    // Compute animation delay
                    const delay = (row + col) * delayStep;

                    return (
                        <MemberItemStub
                            key={m.id()}
                            item={m}
                            onClick={async () => {
                                await props.Session.changeBase(m)
                                router.push(`/be/${m.id()}`)
                            }}
                            style={{
                                animationDelay: `${delay}ms`,
                            }}
                        />
                    )
                })}
                {(searchedBases && Session.bases) && searchedBases.length != Session.bases.length && (
                    <Button
                        fullWidth
                        onClick={() => {
                            setSearchedBases(Session.bases)
                        }}>See All</Button>
                )}
            </div>




        </div>
    );
}

export default ProfilePage;
