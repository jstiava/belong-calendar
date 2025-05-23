'use client';
import { AppPageProps, Type } from '@/types/globals';
import { useRouter } from 'next/router';
import { SessionProtectedAppPageProps } from '@/types/globals';
import { Avatar, Button, ButtonBase, IconButton, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useState } from 'react';
import useIAM from '@/lib/global/useIAM';
import LargeTextField from '@/components/LargeTextField';
import SmallTextField from '@/components/SmallTextField';
import LargeBaseCard from '@/components/bases/LargeBaseCard';
import { Group, ImageDisplayType, MemberFactory } from '@/schema';
import ItemStub from '@/components/ItemStub';
import axiosInstance from '@/lib/utils/axios';
import { SaveOutlined, PhotoLibraryOutlined } from '@mui/icons-material';
import ColorPaletteSelector from '@/components/accordions/ColorPaletteSelector';
import useComplexFileDrop, { UploadType } from '@/lib/useComplexFileDrop';

const MainBasePage = (props: AppPageProps) => {

    const router = useRouter();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const Session = props.Session;
    const Base = props.Base;
    const item = props.module ? props.module : props.Session.base;
    const Controller = props.module ? props.Module : Base;
    const columns = 3;
    const delayStep = 100;

    const [newItem, setNewItem] = useState(item);
    const [uploads, setUploads] = useState<UploadType[]>([]);
    const { FileUpload, FilePreview, handleUpload, openDialog, isUploadPresent, isFileUploadOpen, uploadCount } = useComplexFileDrop(MemberFactory.collect_media(item), uploads, setUploads);
    const prefix = '/me/';

    const handleChange = (eventOrName: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, value: any) => {
        if (typeof eventOrName === "string") {
            setNewItem((prev: any) => ({
                ...prev,
                [eventOrName]: value
            }));
            return;
        }
        if (!eventOrName.target.name) {
            return;
        }
        setNewItem((prev: any) => ({
            ...prev,
            [eventOrName.target.name]: value
        }));
    }

    return (
        <div id="main"
            className="column relaxed"
            style={{
                padding: "2rem"
            }}>
            <div className="column relaxed">
                <div className="column compact">
                    <Typography variant="h4">Settings</Typography>
                    <Typography>Manage preferences, privacy, and options.</Typography>
                </div>

                <div className="column relaxed" style={{
                    maxWidth: '40rem'
                }}>
                    <div className="column left">
                        <Typography variant='h6' sx={{
                            width: "100%"
                        }}>Details</Typography>
                        {FileUpload}
                        <div className="flex">
                            <IconButton key="media" onClick={() => openDialog()} style={{ position: "relative", height: "fit-content" }}>
                                <PhotoLibraryOutlined sx={{
                                    color: "var(--text-color)"
                                }} />
                            </IconButton>
                            <SmallTextField
                                value={item.name}
                            />
                            <ColorPaletteSelector
                                item={newItem}
                                fontSize='1rem'
                                handleChange={(e, value) => {
                                    setNewItem(prev => ({
                                        ...prev,
                                        theme_color: value
                                    }))
                                    return;
                                }}
                            />
                        </div>
                        <div className="flex fit">
                            <Button
                                onClick={async () => {

                                    const files = await handleUpload(`groups/${(Session.base as any).username! || Session.base.uuid}`);

                                    const icon = files.find(x => x.display_type === ImageDisplayType.Portrait);
                                    (newItem as any).icon_img = icon || null;

                                    const cover = files.find(x => x.display_type === ImageDisplayType.Cover);
                                    (newItem as any).cover_img = cover || null;
                                    
                                    const wordmark = files.find(x => x.display_type === ImageDisplayType.Wordmark);
                                    (newItem as any).wordmark_img = wordmark || null;

                                    Controller.update(item.type, newItem)
                                        .then((res : any) => {
                                            router.reload();
                                        })
                                }}
                                startIcon={<SaveOutlined />}
                                variant='contained'
                            >Save</Button>
                        </div>
                    </div>

                    <div className="column">
                        <Typography variant='h6' sx={{
                            width: "100%"
                        }}>Destructive</Typography>
                        <div className="flex between">
                            <div className="column compact fit" style={{
                                width: "calc(100% - 5rem) "
                            }}>
                                <Typography variant="h6" sx={{
                                    textTransform: 'unset',
                                    lineHeight: "115%"
                                }}>Delete this calendar</Typography>
                                <Typography variant="caption" sx={{
                                    lineHeight: "115%"
                                }}>This action is destructive and permenant.</Typography>
                            </div>
                            <div className="flex fit right" style={{
                                width: "5rem"
                            }}>
                                <Button
                                    color="error"
                                    variant="contained"
                                    onClick={() => {

                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                        <div className="flex between">
                            <div className="column compact fit" style={{
                                width: "calc(100% - 5rem) "
                            }}>
                                <Typography variant="h6" sx={{
                                    textTransform: 'unset',
                                    lineHeight: "115%"
                                }}>Purge this calendar</Typography>
                                <Typography variant="caption" sx={{
                                    lineHeight: "115%"
                                }}>This action is destructive and permenant. Recursively deletes the calendar and all sub-items.</Typography>
                            </div>
                            <div className="flex fit right" style={{
                                width: "5rem"
                            }}>
                                <Button
                                    color="error"
                                    variant="contained"
                                    onClick={() => {
                                        axiosInstance.delete(`/api/v1/${item.type.toString().toLowerCase()}s`, {
                                            params: {
                                                purge: true,
                                                [`${item.type.toString().toLowerCase()}_id`]: item.id()
                                            }
                                        })
                                            .then(res => {
                                                enqueueSnackbar("Purge Success", {
                                                    variant: "success"
                                                });
                                                Session.reload();
                                                router.push('/me');
                                            })
                                            .catch(err => {
                                                enqueueSnackbar("Purge failed.", {
                                                    variant: "error"
                                                });
                                            })
                                    }}
                                >
                                    Purge
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainBasePage;
