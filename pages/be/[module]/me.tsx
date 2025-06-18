'use client';
import { AppPageProps, Type } from '@/types/globals';
import { useRouter } from 'next/router';
import { SessionProtectedAppPageProps } from '@/types/globals';
import { Avatar, Button, ButtonBase, IconButton, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useEffect, useState } from 'react';
import useIAM from '@/lib/global/useIAM';
import LargeTextField from '@/components/LargeTextField';
import SmallTextField from '@/components/SmallTextField';
import LargeBaseCard from '@/components/bases/LargeBaseCard';
import { Group, ImageDisplayType, MemberFactory } from '@jstiava/chronos';
import ItemStub from '@/components/ItemStub';
import axiosInstance from '@/lib/utils/axios';
import { SaveOutlined, PhotoLibraryOutlined } from '@mui/icons-material';
import ColorPaletteSelector from '@/components/accordions/ColorPaletteSelector';
import useComplexFileDrop, { UploadType } from '@/lib/useComplexFileDrop';
import jwt, { Secret } from 'jsonwebtoken';

function decode(data: string) {
    const base = jwt.decode(String(data)) as any;
    if (!base) {
        fail("Invalid base token")
        throw Error("No base found")
    }

    return base; 
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    console.log(cookies);
    for (const cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }

    return null;
}

const MainBasePage = (props: AppPageProps) => {

    const router = useRouter();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const [myToken, setMyToken] = useState<string | null>(null);

    const Session = props.Session;
    const Base = props.Base;
    const item = props.module ? props.module : props.Session.base;
    const Controller = props.module ? props.Module : Base;
    const columns = 3;
    const delayStep = 100;

    const [newItem, setNewItem] = useState(item);
    const [uploads, setUploads] = useState<UploadType[]>([]);
    const { FileUpload, FilePreview, handleUpload, openDialog, isUploadPresent, isFileUploadOpen, uploadCount } = useComplexFileDrop(MemberFactory.collect_media(item as any), uploads, setUploads);
    const prefix = '/me/';



    useEffect(() => {
        setMyToken(getCookie('session'))
    }, []);

    return (
        <div id="main"
            className="column relaxed"
            style={{
                padding: "2rem"
            }}>
            <div className="column relaxed">
                <div className="column compact">
                    <Typography variant="h4">About Me</Typography>
                    <Typography>Your identity relative to the base.</Typography>
                </div>

                <div className="column relaxed" style={{
                    maxWidth: "calc(100% - 2rem)",
                    width: '60rem'
                }}>
                    <div className="column left" style={{
                    }}>
                        <Typography variant='h6' sx={{
                            width: "100%"
                        }}>Who is me?</Typography>

                        <div className="flex between top">
                            <Typography>Session Token</Typography>
                            <Typography sx={{
                                width: "calc(100% - 15rem) ",
                                textWrap: 'wrap',
                                textAlign: 'left',
                                whiteSpace: 'normal',
                                wordWrap: 'break-word', /* legacy but useful */
                                overflowWrap: 'break-word'
                            }}>{myToken}</Typography>
                        </div>

                        <div className="flex between top">
                            <Typography>Token for {item.name}</Typography>
                            <Typography sx={{
                                width: "calc(100% - 15rem) ",
                                textAlign: 'left',
                                whiteSpace: 'normal',
                                wordWrap: 'break-word', /* legacy but useful */
                                overflowWrap: 'break-word'
                            }}>{JSON.stringify(decode(MemberFactory.getToken(item) || ''), null, 2)}</Typography>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainBasePage;
