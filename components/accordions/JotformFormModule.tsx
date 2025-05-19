"use client"
import { AppsOutlined, CalendarMonthOutlined, CalendarTodayOutlined, CancelOutlined, PeopleOutline, ScheduleOutlined } from '@mui/icons-material';
import {
  Button,
  ButtonBase,
  CircularProgress,
  Popover,
  ToggleButton,
  Typography,
  useTheme,
} from '@mui/material';
import dayjs from '@/lib/utils/dayjs';
import { EventData, Events, GroupData, Member, MemberFactory, Schedule } from '@/schema';
import Chronos from '@/lib/utils/chronos';
import { CreatorPanelProps, StartCreator } from '@/lib/global/useCreate';
import StyledDatePicker from '../StyledDatePicker';
import StyledTimePicker from '../TimePicker';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/utils/axios';
import { Mode, Type } from '@/types/globals';
import CodeMirrorEditor from '../CodeMirrorEditor';



interface JotformFormModuleProps {
  item: (GroupData & CreatorPanelProps) | null;
  handleChange: any;
  expanded: any;
  onChange: any;
  handleMultiChange: any;
  source: Member;
  startCreator: StartCreator;
  props?: any;
}

export default function JotformFormModule({
  item,
  handleChange,
  expanded,
  onChange,
  handleMultiChange,
  source,
  startCreator,
  ...props
}: JotformFormModuleProps) {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [questions, setQuestions] = useState<any[] | null>(null);

  useEffect(() => {

    if (questions) {
      return;
    }
    axiosInstance.get(`/api/v1/auth/jotform/actions`, {
      params: {
        uuid: source.id(),
        source: MemberFactory.getToken(source),
        form_id: item.uuid,
        action: 'getSubmissionVariables'
      }
    })
      .then(res => {
        setQuestions(res.data.variables)
      })
      .catch(err => {
        console.log(err);
      })

      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (!item || !questions) {
    return (
      <div className="flex center middle">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="column left" style={{
      padding: '0.5rem 0'
    }}>

      <div className="column left top snug">

        <div className="flex between">
          <Typography variant='h6' sx={{
            width: 'fit-content'
          }}>Actions</Typography>
        </div>

        <div className="flex compact">
          <Button
            href=''
            onClick={(e) => {
              e.preventDefault();
              startCreator(Type.Event, Mode.Create, null, {
                callback: (theNewEvent: EventData) => {
                  console.log(theNewEvent)
                },
                variables: questions.map((x) => ({
                  label: x.text,
                  slug: x.name,
                  isCanBeNull: true
                }))
              })
            }}
             startIcon={<CalendarMonthOutlined fontSize="small" />}
             sx={{
              padding: "0.25rem 0.75rem",
              fontWeight: 600
             }}
          >
            Create Event</Button>
          <Button
            href=''
            onClick={(e) => {
              e.preventDefault();
              startCreator(Type.Profile, Mode.Create, null, {
                callback: (theNewEvent: EventData) => {
                  console.log(theNewEvent)
                },
                variables: questions.map((x) => ({
                  label: x.text,
                  slug: x.name,
                  isCanBeNull: true
                }))
              })
            }}
            startIcon={<PeopleOutline fontSize="small" />}
             sx={{
              padding: "0.25rem 0.75rem",
              fontWeight: 600
             }}
          >
            
            Create Profile</Button>

        </div>

      </div>
    </div>
  )

}