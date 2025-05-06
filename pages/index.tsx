'use client';
import React, { ChangeEvent, useState } from 'react';
import { Button, TextField, Typography, useTheme } from '@mui/material';
import { LoginProfileGuess } from '@/types/globals';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';

export default function LoginPage(props: any) {

  const router = useRouter();
  const theme = useTheme();
  const [loginCred, setLoginCred] = useState<LoginProfileGuess>({
    username: '',
    password: '',
  });

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleLoginCredPasswordChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const passwordString = target.value;

    setLoginCred(prev => ({
      ...prev,
      password: passwordString,
    }));
  };

  const handleLoginCredUsernameChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const usernameString = target.value;
    setLoginCred(prev => ({
      ...prev,
      username: usernameString,
    }));
  };

  const handleSubmit = () => {
    console.log('Log in button pressed.');
    const allValuesFilled = Object.values(loginCred).every(value => value !== '');
    if (!allValuesFilled) {
      return enqueueSnackbar('Not all fields are filled in.', {
        variant: 'error',
      });
    }
    props.Session.login(loginCred);
  };

  return (
    <div id="content" className='flex center middle' style={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, width: "100vw", height: "100vh" }} >
      <div className="column relaxed" style={{ width: "20rem" }}>
        <div className="flex center middle">
          <Typography variant="h4">belong.</Typography>
        </div>
        <div className="column">
        <Typography variant="h6">Login</Typography>
        <div className='column compact'>
          <TextField
            key="username"
            type="username"
            label="Username"
            variant="outlined"
            value={loginCred.username}
            onChange={handleLoginCredUsernameChange}
            sx={{ width: '100%' }}
          />
          <TextField
            key="password"
            type="password"
            label="Password"
            variant="outlined"
            value={loginCred.password}
            onChange={handleLoginCredPasswordChange}
            sx={{ width: '100%' }}
          />
          <Button variant="contained" onClick={handleSubmit} style={{ width: '100%' }}>
            Login
          </Button>
          <Button variant="outlined" onClick={() => router.push('/register')} style={{ width: '100%' }}>
            Register
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
