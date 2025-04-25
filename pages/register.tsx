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
} from '@mui/material';

import { NewProfileRequest } from '@/types/globals';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

export default function CreateProfilePage(props: any) {
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
