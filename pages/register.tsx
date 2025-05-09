'use client';
import React, { useState } from 'react';
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

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    const isMatch: boolean = input.match(alphaOnlyWithSpace) !== null;
    if (isMatch || input === '') {
      return setNewProfile(prev => ({ ...prev, name: input }));
    }
  };

  const handleChangeNickname = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    const isMatch: boolean = input.match(alphaOnly) !== null;
    if (isMatch || input === '') {
      return setNewProfile(prev => ({ ...prev, nickname: input }));
    }
  };

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    const isMatch: boolean = input.match(alphaOnly) !== null;
    if (isMatch || input === '') {
      setErrors((prev: any) => ({ ...prev, usernameFlag: false }));
      return setNewProfile(prev => ({ ...prev, username: input }));
    }
    return setErrors((prev: any) => ({ ...prev, usernameFlag: true }));
  };

  const checkPasswordMatch = (updated: string, other: string) => {
    if (updated === other) {
      return setErrors((prev: any) => ({
        ...prev,
        passwordDoesNotMatch: false,
      }));
    }
    return setErrors((prev: any) => ({ ...prev, passwordDoesNotMatch: true }));
  };

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    const isMatch = input.match(emailEnd);
    if (isMatch || input === '') {
      // Use SSO
      // if (isMatch[1] === 'wustl.edu') {
      //     setUseSSO(true);
      // }
    }

    return setNewProfile(prev => ({ ...prev, email: input }));
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    checkPasswordMatch(input, newProfile.reenterPassword);
    return setNewProfile(prev => ({ ...prev, password: input }));
  };

  const handleReenterPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    checkPasswordMatch(input, newProfile.password);
    return setNewProfile(prev => ({ ...prev, reenterPassword: input }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      console.log('Selected file:', file.name);

      // Update the state with the selected file
      setSelectedFile(file);
    }
  };

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
      .post('/api/register', { ...newProfile, username: newProfile.email })
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
              label="Username"
              variant="outlined"
              value={newProfile.username}
              // onChange={handleLoginCredUsernameChange}
              sx={{ width: '100%' }}
            />
            <TextField
              key="email"
              type="email"
              label="Email"
              variant="outlined"
              value={newProfile.email}
              // onChange={handleLoginCredUsernameChange}
              sx={{ width: '100%' }}
            />
            <TextField
              key="password"
              type="password"
              label="Password"
              variant="outlined"
              value={newProfile.password}
              // onChange={handleLoginCredPasswordChange}
              sx={{ width: '100%' }}
            />
            <TextField
              key="confiormPassword"
              type="confiormPassword"
              label="Confirm Password"
              variant="outlined"
              value={newProfile.reenterPassword}
              // onChange={handleLoginCredPasswordChange}
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

  return (
    <>
      <div
        id="content"
        className='flex center' style={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, width: "100vw", height: "100vh" }}

      >
        <div className='column' style={{ width: "20rem", paddingTop: "10vh" }}>
          <h2>Create New Profile</h2>

          <TextField
            required
            type="email"
            label="Email"
            variant="outlined"
            value={newProfile.email}
            onChange={handleChangeEmail}
            helperText="Used for account verification."
            sx={{ width: '100%' }}
          />

          <FormControl required variant="outlined" sx={{ width: '100%' }}>
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
              disabled={useSSO}
              type={showPassword ? 'text' : 'password'}
              value={newProfile.password}
              onChange={handlePasswordChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>

          <TextField
            type="password"
            label="Re-enter Password"
            variant="outlined"
            required
            disabled={useSSO}
            value={newProfile.reenterPassword}
            onChange={handleReenterPasswordChange}
            error={errors.passwordDoesNotMatch}
            helperText={
              errors.passwordDoesNotMatch && 'Required. The password fields do not match.'
            }
            sx={{ width: '100%' }}
          />

          <LinearProgress variant="determinate" value={10} color="primary" />

          {useSSO ? (
            <>
              <Alert icon={<InfoIcon fontSize="inherit" />} severity="info">
                You may be able to use single-sign on, allowing you to authenticate yourself
                through your organization directly. Your password is never shared with Mozi.
              </Alert>
              <ThemeProvider theme={theme}>
                <Button variant="contained">Continue with WUSTL</Button>
              </ThemeProvider>
            </>
          ) : (
            <>
              <Button variant="contained" disabled={blockSubmit} onClick={handleSubmit} sx={{ width: '100%' }}>
                Register
              </Button>
              <Button variant="outlined" onClick={() => router.push('/login')}>
                Login
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
