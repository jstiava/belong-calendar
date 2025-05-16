'use client';
import React, { ChangeEvent, useState } from 'react';
import axios from '@/lib/utils/axios';
import { ThemeProvider } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  OutlinedInput,
  Alert,
  LinearProgress,
  useTheme,
  Typography,
  Link,
  ButtonBase,
  Avatar,
} from '@mui/material';

import { NewProfileRequest, Type } from '@/types/globals';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import ResolveItemIcon from '@/components/ResolveItemIcon';
import { DIVIDER_NO_ALPHA_COLOR } from '@/components/Divider';

export default function RegisterPage(props: any) {
  const router = useRouter();
  const theme = useTheme();

  const [newProfile, setNewProfile] = React.useState<NewProfileRequest>({
    name: '',
    nickname: '',
    username: '',
    email: '',
    password: '',
    reenterPassword: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [showPassword, setShowPassword] = React.useState(false);
  const [blockSubmit, setBlockSubmit] = React.useState(false);
  const [errors, setErrors] = React.useState<any>({
    usernameFlag: false,
    passwordDoesNotMatch: false,
  });
  const [useSSO, setUseSSO] = React.useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const minLength = 12;
  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const alphaOnly: RegExp = /^[a-zA-Z0-9]+$/;
  const alphaOnlyWithSpace: RegExp = /^[a-zA-Z0-9\s]+$/;
  const emailEnd: RegExp = /@(.+)$/;

  const handleChange = (eventOrName: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, value: any) => {
    if (typeof eventOrName === "string") {
      setNewProfile((prev: any) => ({
        ...prev,
        [eventOrName]: value
      }));
      return;
    }
    if (!eventOrName.target.name) {
      return;
    }
    setNewProfile((prev: any) => ({
      ...prev,
      [eventOrName.target.name]: value
    }));
  }

  const handleSubmit = async () => {
    // const allValuesAreFalse = Object.values(errors).every(value => value === false);

    // if (!allValuesAreFalse) {
    //   return enqueueSnackbar('An error is still active on the form.', {
    //     variant: 'error',
    //   });
    // }

    // const allValuesFilled = Object.values(newProfile).every(value => value !== '');
    // if (!allValuesFilled) {
    //   return enqueueSnackbar('Not all fields are filled in.', {
    //     variant: 'error',
    //   });
    // }

    axios
      .post('/api/register', { ...newProfile, username: newProfile.username ? newProfile.username : newProfile.email })
      .then(res => {
        enqueueSnackbar('Profile successfully created.', {
          variant: 'success',
        });
        router.push('/login', undefined, { shallow: true });
      })
      .catch(error => {
        console.log(error)
        return enqueueSnackbar("Something went wrong.", {
          variant: 'error',
        });
      });
  };


  return (
    <div id="content" className='flex center middle' style={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, width: "100vw", height: "100vh" }} >
      <div className="column relaxed" style={{ width: "20rem", marginBottom: "10rem" }}>
        <div className="flex center middle">
          <Typography variant="h4">belong.</Typography>
        </div>

        <div className="column">
          <ButtonBase
            className='flex compact center middle'
            sx={{
              width: "100%",
              borderRadius: "0.25rem",
              border: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
              padding: "0.5rem 0.75rem"
            }}>
            <Avatar sx={{
              width: '1.75rem',
              height: "1.75rem",
              backgroundColor: '#517ec0',
            }}><ResolveItemIcon
                sx={{
                  fontSize: '0.875rem'
                }}
                item={{
                  integration: "google",
                  type: Type.Group
                }} /></Avatar>
            <Typography sx={{
              fontWeight: 700
            }}>Continue with Google</Typography>
          </ButtonBase>
        </div>
        <div className="column">
          <Typography variant="h6">Register</Typography>
          <div className='column compact'>
            <TextField
              key="username"
              type="username"
              name="username"
              label="Username"
              variant="outlined"
              value={newProfile.username}
              onChange={(e) => {
                handleChange(e, e.target.value);
              }}
              sx={{ width: '100%' }}
            />
            <TextField
              key="email"
              type="email"
              label="Email"
              name="email"
              variant="outlined"
              value={newProfile.email}
              onChange={(e) => {
                handleChange(e, e.target.value);
              }}
              sx={{ width: '100%' }}
            />
            <TextField
              key="password"
              type="password"
              name="password"
              label="Password"
              variant="outlined"
              value={newProfile.password}
              onChange={(e) => {
                handleChange(e, e.target.value);
              }}
              sx={{ width: '100%' }}
            />
            <TextField
              key="reenterPassword"
              type="password"
              name="reenterPassword"
              label="Re-enter Password"
              variant="outlined"
              value={newProfile.reenterPassword}
              onChange={(e) => {
                handleChange(e, e.target.value);
              }}
              sx={{ width: '100%' }}
            />

          </div>
        </div>
          <div className="column compact">
            <Button size='large' variant="contained" onClick={handleSubmit} style={{ width: '100%' }}>
              Register
            </Button>
            <div className="flex left">
              <Link
                href="/login"
                sx={{
                  opacity: 0.75,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  textDecorationColor: theme.palette.text.primary
                }}>Already have an account? Login.</Link>
            </div>
          </div>
      </div>
    </div>
  )
}
