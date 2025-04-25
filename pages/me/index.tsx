'use client';
import { useRouter } from 'next/router';
import { SessionProtectedAppPageProps } from '@/types/globals';
import { Avatar, Button, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useState } from 'react';
import useIAM from '@/lib/global/useIAM';
import LargeTextField from '@/components/LargeTextField';
import SmallTextField from '@/components/SmallTextField';

const ProfilePage = (props: SessionProtectedAppPageProps) => {
    const router = useRouter();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const Session = props.Session;
    const item = props.Session.session;

    const [newItem, setNewItem] = useState(item);
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

    if (!Session.session) {
        return <><Typography>Loading session page.</Typography></>
    }

    return (
        <div id="content">
             <div className="column" style={{
                padding: "5rem",
                maxWidth: "50rem"
             }}>
                <Typography variant="h6">Edit Profile</Typography>
                <Avatar 
                    src={Session.session.icon_img ? Session.session.getIconPath() : ''}
                sx={{
                    width: "5rem",
                    height: "5rem",
                }}/>
                <LargeTextField
                  label={`New ${item.type} Name`}
                  variant="standard"
                  key="item_name"
                  name="name"
                  hiddenLabel
                  multiline
                  maxRows={4}
                  value={newItem && newItem.name}
                  spellCheck={false}
                  onChange={(e) => handleChange(e, e.target.value)}
                  placeholder={`${item.type} Name`}
                />
                 <SmallTextField
                  name="username"
                  variant="standard"
                  label="Username"
                  value={newItem.username || ""}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
                 <SmallTextField
                  name="nickname"
                  variant="standard"
                  label="Nickname"
                  value={newItem.nickname || ""}
                  onChange={(e) => handleChange("nickname", e.target.value)}
                />
                 <SmallTextField
                  name="theme_color"
                  variant="standard"
                  label="Theme Color"
                  value={newItem.theme_color || ""}
                  onChange={(e) => handleChange("theme_color", e.target.value)}
                />

                <Button 
                    variant='contained'
                    sx={{
                        width: "fit-content"
                    }}
                onClick={() => {
                    return;
                }}>Save</Button>
             </div>
        </div>
    );
}

export default ProfilePage;
