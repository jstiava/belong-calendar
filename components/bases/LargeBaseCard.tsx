"use client"
// import axios from '@/utils/axios';

import {
  Avatar,
  Button,
  ButtonBase,
  Link,
  Typography,
  styled,
  useTheme,
  alpha,
  darken,
  lighten,
} from '@mui/material';
import axios from '@/lib/utils/axios';
import { AxiosRequestConfig, AxiosProgressEvent, CancelTokenSource } from 'axios';
import axiosExternal from 'axios';
import React, { useCallback, useState, Dispatch, SetStateAction, useEffect, MouseEvent, CSSProperties } from 'react';
import { Google, Portrait } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { Group, Member, Membership } from '@jstiava/chronos';
import { AppPageProps, getIntegrationIcon } from '@/types/globals';

const MEDIA_BASE_URI = "https://mozi-belong-media-public-demo.s3.us-east-2.amazonaws.com";

export default function BaseCard({
  wrap,
  groupMember,
  onClick,
  style = {}
}: {
  wrap?: boolean;
  groupMember: Group;
  onClick: () => any;
  style?: CSSProperties
}) {
  const theme = useTheme();
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const integration = groupMember.integration ? getIntegrationIcon(groupMember.integration) : null;

  return (
    <>
      <ButtonBase
        sx={{
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          height: "9rem",
          alignItems: 'center',
          backgroundImage: groupMember.cover_img ? `url${groupMember.cover_img.path}` : 'unset',
          backgroundSize: "cover",
          backgroundPosition: 'center',
          backgroundColor: groupMember.theme_color ? theme.palette.mode === 'light' ? lighten(groupMember.getItem().theme_color!, 0.9) : darken(groupMember.getItem().theme_color!, 0.9) : theme.palette.background.paper,
          ...style,
          // backgroundColor: alpha(groupMember.theme_color, 0.05)
        }}
        onClick={onClick}
      >
        <div className="column compact center middle">
          <Avatar
            sx={{
              width: '2rem',
              height: '2rem',
              backgroundColor: groupMember.getItem().theme_color || theme.palette.background.paper,
              color: groupMember.getItem().theme_color ? theme.palette.getContrastText(groupMember.getItem().theme_color || "") : theme.palette.text.primary,
              border: `2px solid ${groupMember.getItem().theme_color}`,
              fontSize: "0.9rem",
            }}
            alt={groupMember.getItem().name ? String(groupMember.getItem().name) : ''}
            src={integration ? integration : `${MEDIA_BASE_URI}/${groupMember.getIconPath()}`}
          >
            {groupMember.integration === 'google' && (
              <Google />
            )}
          </Avatar>
          <div
            className="inner"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginLeft: "-0.25rem",
              color: theme.palette.text.primary
            }}
          >
            <Typography
              variant="h4"
              component="h3"
              sx={{
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                width: "100%"
              }}
            >
              {groupMember.getItem().name}
            </Typography>
            {/* <Typography variant="subtitle2" sx={{ textTransform: "capitalize", textAlign: 'left' }}>{groupMember.uuid}</Typography> */}
          </div>
        </div>
      </ButtonBase >

    </>
  );
}


