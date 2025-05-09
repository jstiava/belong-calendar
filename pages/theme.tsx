import ColorPaletteSelector from "@/components/accordions/ColorPaletteSelector";
import StyledDatePicker from "@/components/StyledDatePicker";
import LargeTextField from "@/components/LargeTextField";
import { Box, Button, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, ThemeProvider, Typography, createTheme, lighten, useTheme } from "@mui/material";
import { Source_Sans_3 } from 'next/font/google';
import React, { ChangeEvent, useRef, useState } from "react";
import StyledTimePicker from "@/components/TimePicker";
import { AddOutlined, ArrowDropDownCircleOutlined, CheckBoxOutlined, Lock, RadioButtonCheckedOutlined, SmartButton, TextFieldsOutlined, WarningAmberOutlined } from "@mui/icons-material";
import StyledWeekPicker from "@/components/calendar/WeekPicker";
import { AppPageProps, Mode, Type } from "@/types/globals";
import { EventData, Events, Group, Profile, Schedule } from "@/schema";
import Chronos from "@/lib/utils/chronos";
import dayjs from "@/lib/utils/dayjs";
import { Dayjs } from "dayjs";
import HoursMinimap from "@/components/HoursMinimap";
import useCreator from "@/lib/global/useCreate";
import useBase from "@/lib/global/useBase";
import useSession from "@/lib/global/useSession";
import useEvents from "@/lib/global/useEvents";
import useCalendar from "@/lib/useCalendar";
import { DIVIDER_NO_ALPHA_COLOR } from "@/components/Divider";
import Editor from "@/components/Editor";

const sora = Source_Sans_3({ subsets: ['latin'] });


const session = new Profile({
    "uuid": "a151902a-b398-4016-8a29-68bfa67842f3",
    "name": "jeremystiava",
    "nickname": "jeremystiava",
    "username": "jeremystiava",
    "email": "jeremystiava",
    "valid": false,
    "icon_img": null
})

const source = new Group({
    "uuid": "f3822ce1-dd00-4e7d-86b1-2cfe5ec48237",
    "name": "Jeremy Stiava",
    "theme_color": "#a51417",
    "valid": null,
    "nickname": null,
    "username": "jeremy_stiava",
    "tagline": null,
    "cover_img": null,
    "icon_img": null,
    "access_token": null,
    "access_token_expires": null,
    "refresh_token": null,
    "refresh_token_expires": null,
    "scope": null,
    "integration": null
});

const initialTokens = [
    { type: 'text', value: 'Hello ', label: '' },
    { type: 'chip', value: 'firstName', label: 'First Name' },
    { type: 'text', value: ', welcome back!', label: '' },
];



function DraggableChip({ label, onDelete }: { label: string, onDelete: any }) {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", label);
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <Chip
            label={label}
            draggable
            onDragStart={handleDragStart}
            size="small"
            color="primary"
            style={{ cursor: "grab" }}
            onDelete={onDelete}
        />
    );
}


const parseTextToTokens = (text: string) => {
    const regex = /{([^}]+)}/g;
    const tokens: { type: 'text' | 'chip'; value: string }[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        const index = match.index;

        // Text before chip
        if (index > lastIndex) {
            tokens.push({ type: 'text', value: text.slice(lastIndex, index) });
        }

        // Chip content
        tokens.push({ type: 'chip', value: match[1] });

        lastIndex = regex.lastIndex;
    }

    // Remaining text after last chip
    if (lastIndex < text.length) {
        tokens.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return tokens;
};


export default function ThemePage(props: AppPageProps) {
    const editableRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    // const handleChipDelete = (index: number) => {
    //     setTokens((prev) => [
    //         ...prev.slice(0, index),
    //         { type: 'text', value: '', label: '' }, // Replace chip with empty editable text
    //         ...prev.slice(index + 1),
    //     ]);
    // };

    const [schedule, setSchedule] = useState<Schedule | null>(new Schedule());

    return (
        <div id="content"
            className="column"
            style={{
                marginTop: "10rem",
                padding: "1rem",
                width: "35rem"
            }}>

            <div className="column relaxed">

                {schedule && (
                     <div className="column left" style={{
                        width: "25rem",
                      }}>

                    <HoursMinimap
                    mode="dark"
                    schedule={schedule}
                    onChange={(newSch) => setSchedule(newSch)}
                    />
                    </div>
                )}

                {Object.entries(QUESTIONS).map(([key, q]) => {

                    if (['control_fullname', 'control_textbox', 'control_email'].some(x => x === q.type)) {
                        return (
                            <div className="flex compact" key={q.qid}>
                                <TextFieldsOutlined sx={{
                                    fontSize: "1rem"
                                }} />
                                <Typography>{q.text}</Typography>
                            </div>
                        )
                    }
                    else if (q.type === 'control_radio') {
                        return (
                            <div className="column compact2 left" key={q.qid}>
                                <div className="column compact2 left" style={{
                                    width: "calc(100% - 20rem)"
                                }}>
                                    <div className="flex compact" >
                                        <RadioButtonCheckedOutlined sx={{
                                            fontSize: "1rem"
                                        }} />
                                        <Typography>{q.text}</Typography>
                                    </div>

                                </div>
                                {'options' in q && (
                                    <div className="flex compact2 right" style={{
                                        flexWrap: 'wrap'
                                    }}>
                                        {q.options.split('|').map(o => (
                                            <Chip size="small" key={o} label={o} sx={{
                                                marginBottom: "0.5rem"
                                            }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }
                    else if (q.type === 'control_checkbox') {
                        return (
                            <div className="column compact2 left" key={q.qid}>
                                <div className="flex compact" key={q.qid}>
                                    <CheckBoxOutlined sx={{
                                        fontSize: "1rem"
                                    }} />
                                    <Typography key={q.qid}>{q.text}</Typography>
                                </div>
                                {'options' in q && (
                                    <div className="flex compact2 right" style={{
                                        flexWrap: 'wrap'
                                    }}>
                                        {q.options.split('|').map(o => (
                                            <Chip size="small" key={o} label={o} sx={{
                                                marginBottom: "0.5rem"
                                            }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }
                    else if (q.type === 'control_dropdown') {
                        return (
                            <div className="column compact2 left" key={q.qid}>
                                <div className="flex compact" >
                                    <ArrowDropDownCircleOutlined sx={{
                                        fontSize: "1rem"
                                    }} />
                                    <Typography>{q.text}</Typography>
                                    {'hidden' in q && q.hidden === 'Yes' && <Typography variant="caption" sx={{
                                        opacity: 0.5
                                    }}>(Hidden)</Typography>}
                                </div>
                                {'options' in q && (
                                    <div className="flex compact fit">
                                        {q.options.split('|').map(o => (
                                            <Chip size="small" key={o} label={o} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }
                    else if (q.type === 'control_button') {
                        return null;
                    }
                    else if (q.type === 'control_head') {
                        return null;
                    }
                    else {
                        return (
                            <Typography key={q.qid}>{q.text} - {q.type} </Typography>
                        )
                    }
                })}
            </div>
        </div>
    )

}


const QUESTIONS = {
    '1': {
        headerType: 'Large',
        imageAlign: 'Left',
        name: 'heading',
        order: '1',
        qid: '1',
        subHeader: '',
        text: 'Gephardt Event RSVP Form',
        textAlign: 'Left',
        type: 'control_head',
        verticalTextAlign: 'Middle'
    },
    '2': {
        buttonAlign: 'Auto',
        buttonStyle: 'None',
        clear: 'No',
        clearText: 'Clear All Questions',
        encryptIcon: 'No',
        name: 'submit2',
        order: '12',
        print: 'No',
        printText: 'Print',
        qid: '2',
        text: 'Submit',
        type: 'control_button'
    },
    '4': {
        compoundHint: ',',
        description: '',
        labelAlign: 'Auto',
        middle: 'No',
        name: 'name',
        order: '3',
        prefix: 'No',
        prefixChoices: '',
        qid: '4',
        readonly: 'No',
        required: 'No',
        sublabels: {
            prefix: 'Prefix',
            first: 'First Name',
            middle: 'Middle Name',
            last: 'Last Name',
            suffix: 'Suffix'
        },
        suffix: 'No',
        text: 'Name',
        type: 'control_fullname'
    },
    '7': {
        allowCustomDomains: 'No',
        allowedDomains: '',
        autoFixed: 'No',
        confirmation: 'No',
        confirmationHint: 'example@example.com',
        confirmationSublabel: 'Confirm Email',
        defaultValue: '',
        description: '',
        disallowFree: 'No',
        domainCheck: 'No',
        hint: '',
        labelAlign: 'Auto',
        maxsize: '',
        name: 'email',
        order: '6',
        qid: '7',
        readonly: 'No',
        required: 'No',
        size: '310',
        subLabel: 'example@example.com',
        text: 'Email',
        type: 'control_email',
        validation: 'Email',
        verificationCode: 'No'
    },
    '19': {
        autoFixed: 'No',
        defaultValue: '',
        description: '',
        hint: '',
        inputTextMask: '',
        labelAlign: 'Auto',
        maxsize: '',
        name: 'preferredName',
        order: '4',
        qid: '19',
        readonly: 'No',
        required: 'No',
        size: '310',
        subLabel: '',
        text: 'Preferred Name',
        type: 'control_textbox',
        validation: 'None'
    },
    '20': {
        autoFixed: 'No',
        defaultValue: '',
        description: '',
        hint: '',
        inputTextMask: '',
        labelAlign: 'Auto',
        maxsize: '',
        name: 'pronouns',
        order: '5',
        qid: '20',
        readonly: 'No',
        required: 'No',
        size: '310',
        subLabel: '',
        text: 'Pronouns',
        type: 'control_textbox',
        validation: 'None'
    },
    '21': {
        allowOther: 'No',
        calcValues: '',
        description: '',
        labelAlign: 'Auto',
        name: 'classRole',
        options: '2025|2026|2027|Graduate Student|Professional Student|Parent',
        order: '7',
        otherText: 'Other',
        qid: '21',
        readonly: 'No',
        required: 'No',
        selected: '',
        shuffle: 'No',
        special: 'None',
        spreadCols: '1',
        text: 'Class Role',
        type: 'control_radio'
    },
    '22': {
        autoFixed: 'No',
        defaultValue: '',
        description: '',
        hint: '',
        inputTextMask: '',
        labelAlign: 'Auto',
        maxsize: '',
        name: 'dietaryRestrictions',
        order: '8',
        qid: '22',
        readonly: 'No',
        required: 'No',
        size: '310',
        subLabel: '',
        text: 'Dietary restrictions',
        type: 'control_textbox',
        validation: 'None'
    },
    '23': {
        autoFixed: 'No',
        defaultValue: '',
        description: '',
        hint: '',
        inputTextMask: '',
        labelAlign: 'Auto',
        maxsize: '',
        name: 'accommodations',
        order: '9',
        qid: '23',
        readonly: 'No',
        required: 'No',
        size: '310',
        subLabel: '',
        text: 'Accommodations',
        type: 'control_textbox',
        validation: 'None'
    },
    '24': {
        autoFixed: 'No',
        defaultValue: '',
        description: '',
        hint: '',
        inputTextMask: '',
        labelAlign: 'Auto',
        maxsize: '',
        name: 'additionalQuestions',
        order: '10',
        qid: '24',
        readonly: 'No',
        required: 'No',
        size: '310',
        subLabel: '',
        text: 'Additional Questions? ',
        type: 'control_textbox',
        validation: 'None'
    },
    '25': {
        allowOther: 'No',
        calcValues: '',
        description: '',
        labelAlign: 'Auto',
        maxSelection: '',
        minSelection: '',
        name: 'signUp',
        options: 'Opportunities|Gephardt Monthly Newsletter',
        order: '11',
        otherText: 'Other',
        qid: '25',
        readonly: 'No',
        required: 'No',
        selected: '',
        shuffle: 'No',
        special: 'None',
        spreadCols: '1',
        text: 'Sign up to receive our newsletters?',
        type: 'control_checkbox'
    },
    '26': {
        autoFixed: 'No',
        calcValues: '',
        description: '',
        emptyText: 'Please Select',
        hidden: 'Yes',
        labelAlign: 'Auto',
        multipleSelections: 'No',
        name: 'eventId',
        options: '',
        order: '2',
        qid: '26',
        required: 'Yes',
        searchText: 'Search',
        selected: '',
        shuffle: 'No',
        size: '0',
        special: 'None',
        subLabel: '',
        text: 'Event',
        type: 'control_dropdown',
        visibleOptions: '1',
        width: '310'
    }
}