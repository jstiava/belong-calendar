'use client';
import {
  Paper,
  Typography,
  Modal,
  Button,
  useTheme,
  TextField,
} from '@mui/material';
import { useState, useEffect, useRef, SetStateAction, useMemo, MouseEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import dayjs from '@/lib/utils/dayjs';
import { DateCalendar, DatePicker, TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import axios, { API } from '@/lib/utils/axios';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import Chronos from '@/lib/utils/chronos';
import { v4 as uuidv4 } from 'uuid';
import { Profile, ProfileData } from '@/schema';
import { ChromePicker } from 'react-color';
import useSearchDialog, { UseSearchDialog } from './useSearchDialog';
import { UseSession } from './global/useSession';
import { UseBase } from './global/useBase';
import { UseIAM } from './global/useIAM';
import axiosInstance from '@/lib/utils/axios';

export default function useInviteMembers(People: UseIAM) {
  const router = useRouter();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Profile[]>([]);

  const { enqueueSnackbar } = useSnackbar();


  const [emailString, setEmailString] = useState<string>("");

  const toggleDrawer = (open: boolean) => {
    console.log('Toggle Drawer');
    setIsOpen(open);
  };

  const sendInvite = async () => {

    // const save = emailString;
    // setEmailString("");
    People.invite(selected[0])
      .then(res => {
        setIsOpen(false);
        enqueueSnackbar("Invite sent.", {
          variant: 'success'
        })
      })
      .catch(err => {
        // setEmailString(save);
        enqueueSnackbar("Something went wrong.", {
          variant: 'error'
        })
      })
    return;
  }



  const handleStart = (item: Profile) => {
    setSelected(prev => {
      const filtered = prev.filter(x => x.uuid != item.uuid);
      return [...filtered, item];
    })
    return;
  }

  const searchProfiles = async (q: string): Promise<Profile[]> => {
    return await axiosInstance.post(API.SEARCH_PROFILES, {
      q: `%${q}%`
    })
      .then(res => {
        const results = res.data.candidates.map((item: ProfileData) => {
          return new Profile(item);
        })
        return results;
      })
      .catch(err => {
        return [];
      })
  }

  const searchConfig = {
    purpose: "People",
    itemName: "Person",
    defaultCategory: "globalSearch",
    categories: [
      {
        label: "Users",
        value: "globalSearch",
        search: async (query: string) => await searchProfiles(query)
      },
    ]
  };

  const Form = (
    <>
      <div
        className='column'
        style={{
          width: '100%',
          height: 'fit-content',
          minHeight: '100%',
          padding: "1rem 1rem"
        }}
      >
        <Typography variant="h6">Invite People</Typography>
        {/* <TextField
          label="Send invite email"
          aria-label='Send invite email'
          value={emailString}
          onChange={(e) => setEmailString(e.target.value)}
        /> */}
      </div>
      <div
        className="flex between"
        style={{
          position: 'sticky',
          bottom: 0,
          padding: '1rem 2rem',
          zIndex: '1000',
        }}
      >
        <Button
          color="error"
          variant="text"
          onClick={e => {
            toggleDrawer(false);
          }}
        >
          Cancel
        </Button>
        <div className="flex" style={{ width: 'fit-content' }}>
          <Button
            variant="contained"
            onClick={async () => {
              sendInvite();
            }}
          >
            Invite
          </Button>
        </div>
      </div>
    </>
  );


  const StartModal = (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      keepMounted
    // hideBackdrop
    >
      <div
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            toggleDrawer(false);
          }
        }}
        style={{
          display: "flex",
          padding: "4rem 1rem",
          alignItems: 'flex-end',
          height: '100vh',
          width: '100vw',
        }}
      >
        <Paper
          tabIndex={-1}
          sx={{
            position: 'absolute',
            bottom: '50vh',
            left: '50vw',
            transform: 'translate(-50%, 50%)',
            width: '30rem',
            height: 'fit-content',
            maxHeight: '90vh',
            borderRadius: '0.5rem',
            overflowX: 'hidden',
            overflowY: 'scroll',
            transition: '0.5s ease-in-out left, 0.5s ease-in-out top, 0.5s ease-in-out transform',
          }}
        >
          {Form}
        </Paper>
      </div>
    </Modal>
  );

  return {
    Modal: StartModal,
    toggleDrawer
  };
}
