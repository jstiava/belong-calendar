import React, { useState } from 'react';

import { Button } from '@mui/material';

import { useRouter } from 'next/router';
import Link from 'next/link';
import { mozi_indigo } from '@/colors';
import { Profile, Group } from '@/schema';

interface Props {
  session?: Profile;
  isDarkMode?: boolean;
  isHighConstrastMode?: boolean;
  sessionGroups?: Group[];
  sessionNotifications?: string[];
  sessionAgenda?: string[];
}

export default function Header(props: Props) {
  const router = useRouter();

  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setIsOpen(open);
  };

  const [accountMenuAnchor, setAccountMenuAnchor] = React.useState<null | HTMLElement>(null);
  const isAccountMenuOpen = Boolean(accountMenuAnchor);
  const handleOpenAccountMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };
  const handleCloseAccountMenu = () => {
    setAccountMenuAnchor(null);
  };

  const [notificationMenuAnchor, setNotificationMenuAnchor] = React.useState<null | HTMLElement>(
    null,
  );
  const isNotificationMenuOpen = Boolean(notificationMenuAnchor);
  const handleOpenNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };
  const handleCloseNotificationMenu = () => {
    setNotificationMenuAnchor(null);
  };

  return (
    <>
      <header id="mozi-header" style={{position: 'static'}}>
        <div className="left">
          <p>
            Belong by Mozi
            <br />
            v. alpha
          </p>
        </div>

        <div className="center"></div>

        <div className="right">
          <Link href="/register">
            <Button
              variant="outlined"
              sx={{
                color: 'white',
                backgroundColor: mozi_indigo[700],
                '&:hover': {
                  backgroundColor: mozi_indigo[800],
                },
              }}
            >
              Register
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="contained"
              sx={{
                color: mozi_indigo[900],
                backgroundColor: mozi_indigo[50],
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
            >
              Login
            </Button>
          </Link>
        </div>
      </header>
    </>
  );
}
