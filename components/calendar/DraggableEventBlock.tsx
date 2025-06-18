"use client"
import { StartCreator } from "@/lib/global/useCreate";
import { UseEvents } from "@/lib/global/useEvents";
import { EventData, Chronos, Schedule, Event, Events, isSingleTimeEvent } from '@jstiava/chronos';
import { Mode, Type } from "@/types/globals";
import { AddOutlined, CloseOutlined, RectangleTwoTone } from "@mui/icons-material";
import { alpha, Button, IconButton, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { useState, MouseEvent } from "react";
import { v4 as uuidv4 } from "uuid";


export enum DragMode {
    Moving = "moving",
    DragToCreate = "dragToCreate",
    Paused = "paused",
    AdjustByTop = "adjustByTop"
}

export interface DraggedEventBlockProps {
    uuid?: string | null,
    display: 'flex',
    top: number,
    left: number,
    width: number,
    height: number,
    startY: number,
    currY: number,
    dragDay: dayjs.Dayjs;
    dragEndDay: dayjs.Dayjs;
    dragStart: Chronos;
    currStart: Chronos;
    currEnd: Chronos;
    name?: string | null;
    totalViewTop: number | null;
}

export default function useDraggableEventBlock(
    standardHeight: number,
    topAdjustmentRef: any | null = null,
    handleUpOnMove: (props: any) => Promise<void>,
    handleCreate: StartCreator
) {

    const theme = useTheme();

    const [blocks, setBlocks] = useState<DraggedEventBlockProps[] | null>(null);
    // const [block, setBlock] = useState<DraggedEventBlockProps | null>(null);
    const [mode, setMode] = useState<DragMode | null>(null);
    const [focused, setFocused] = useState<number | null>(null);


    const removeBlock = (i: number) => {

        setBlocks(prev => {
            if (!prev) {
                return null;
            }

            const filtered = prev.filter((b, index) => i != index);
            return filtered;
        })
    }

    const handleUpOnCreate = async () => {

        if (!blocks || blocks.length === 0) {
            return;
        }



        if (blocks.length === 1) {

            const item = blocks[0];
            if (!item.dragDay.isSame(item.dragEndDay, 'date')) {

                const presetSchedule = Schedule.createOffDrag(item.dragDay, item.dragEndDay, new Chronos(item.currStart.getHMN(15)), new Chronos(item.currEnd.getHMN(15)));

                const presets: Partial<EventData> = {
                    date: null,
                    end_date: null,
                    start_time: null,
                    end_time: null,
                    schedules: [presetSchedule.eject()],
                    is_local: true
                }

                handleCreate(Type.Event, Mode.Create, new Event(presets));

                return;
            }

            const presets: Partial<EventData> = {
                // uuid: null,
                date: item.currStart.getHMN() < 6 ? item.dragDay.add(1, 'day').yyyymmdd() : item.dragDay.yyyymmdd(),
                end_date: item.dragDay.isSame(item.dragEndDay, 'date') ? null : item.currEnd.getHMN() < 6 ? item.dragEndDay.add(1, 'day').yyyymmdd() : item.dragEndDay.yyyymmdd(),
                start_time: String(item.currStart.getDayjs(5).toLocalChronos().getHMN()),
                end_time: String(item.currEnd.getDayjs(5).toLocalChronos().getHMN()),
                is_local: true
            }

            handleCreate(Type.Event, Mode.Create, new Event(presets));
        }
        else {

            const objects = [];
            for (const item of blocks) {

                const presets: Partial<EventData> = {
                    date: item.currStart.getHMN() < 6 ? item.dragDay.add(1, 'day').yyyymmdd() : item.dragDay.yyyymmdd(),
                    end_date: item.dragDay.isSame(item.dragEndDay, 'date') ? null : item.currEnd.getHMN() < 6 ? item.dragEndDay.add(1, 'day').yyyymmdd() : item.dragEndDay.yyyymmdd(),
                    start_time: String(item.currStart.getDayjs(5).toLocalChronos().getHMN()),
                    end_time: String(item.currEnd.getDayjs(5).toLocalChronos().getHMN()),
                    is_local: true
                }

                objects.push(new Event(presets));
            }

            console.log(objects);


            const merged = new Schedule();
            for (const item of objects) {
                if (isSingleTimeEvent(item)) {
                    merged.mask({
                        dow: item.date.day(),
                        start_time: item.start_time,
                        end_time: item.end_time
                    });
                }
            }

            console.log(merged)

            handleCreate(Type.Event, Mode.Create, new Event({
                name: "",
                schedules: [merged.eject()]
            }));
        }
    }

    const pushNewBlock = (newBlock: DraggedEventBlockProps) => {


        setFocused(blocks ? blocks.length : 0);
        setBlocks(prev => {

            if (!prev) {
                return [newBlock];
            }
            const filtered = [...prev];
            filtered.push(newBlock)

            return filtered;
        });
    }


    const updateBlock = (newBlock: DraggedEventBlockProps) => {

        setBlocks(prev => {

            if (!prev) {
                return null;
            }

            if (focused === null) {
                return prev;
            }

            const filtered = [...prev];
            filtered[focused] = newBlock;

            return filtered;
        })
    }


    const handleStartDragToMove = (
        e: MouseEvent,
        props: any,
    ) => {
        let rect: HTMLDivElement = e.target as HTMLDivElement;
        while (!rect.classList.contains('eventButton')) {
            if (rect.parentElement === null) {
                return;
            }
            rect = rect.parentElement as HTMLDivElement;
        }
        const computedStyle = window.getComputedStyle(rect);
        const rectDOM: DOMRect = (rect as HTMLDivElement).getBoundingClientRect();

        const y = rectDOM.top + (topAdjustmentRef ? topAdjustmentRef.current.scrollTop : window.scrollY);

        const timeObject = new Chronos(
            props.time + Number(computedStyle.marginTop.slice(0, -2)) / standardHeight / 2,
        );

        const adjustedLeft = rectDOM.left - (16 * 2)

        const newEventBlock: any = {
            uuid: props.uuid,
            display: 'none',
            top: y,
            left: adjustedLeft,
            height: rectDOM.height,
            width: rectDOM.width,
            dragDay: props.date,
            dragStart: timeObject,
            currStart: timeObject,
            currEnd: new Chronos(props.time + Number(rectDOM.height) / standardHeight / 2),
            dragEndDay: new Chronos(props.time + Number(rectDOM.height) / standardHeight / 2),
            dragInitialEnd: timeObject.add(rectDOM.height / standardHeight / 2),
            startY: y,
            currY: y,
            name: props.name ? props.name : null
        };

        updateBlock(newEventBlock)
        setMode(DragMode.Moving);
        return;
    }


    const handleDragStart = (
        e: MouseEvent,
        props: any
    ) => {

        const RIGHT_CLICK = 2;
        if (e.button === RIGHT_CLICK) {
            return;
        }

        if (!e.target) return;
        let target: HTMLDivElement = e.target as HTMLDivElement;
        while (target.dataset.type !== 'emptyEvent') {
            if (target.parentElement === null) {
                return;
            }
            console.log(target);
            target = target.parentElement as HTMLDivElement;
        }

        if (target.dataset.type !== 'emptyEvent') {
            return handleStartDragToMove(e, props);
        }

        const dayElement = target.parentElement;
        const dayContainer = dayElement?.parentElement;
        const totalView = dayContainer?.parentElement;

        console.log(target);

        const rect: DOMRect = target.getBoundingClientRect();
        const totalViewRect = totalView?.getBoundingClientRect();

        if (!totalViewRect || !dayContainer) {
            return;
        }

        const isClosestToTop = rect.top - e.clientY < e.clientY - rect.bottom;
        setMode(DragMode.DragToCreate)

        const startDateObject = isClosestToTop ? new Chronos(props.time) : new Chronos(props.time - 0.5);

        console.log(topAdjustmentRef);
        // const adjustedTop = (isClosestToTop ? rect.bottom : rect.top) + (topAdjustmentRef ? topAdjustmentRef.current.scrollHeight : window.scrollY);
        const adjustedTop = (isClosestToTop ? rect.bottom : rect.top) - totalViewRect.top;
        const adjustedLeft = dayContainer.getBoundingClientRect().left - totalViewRect.left;

        pushNewBlock({
            uuid: String(uuidv4()),
            display: 'flex',
            top: adjustedTop,
            left: adjustedLeft,
            width: rect.width,
            height: rect.height,
            startY: adjustedTop,
            currY: adjustedTop,
            dragDay: props.date,
            dragEndDay: props.date,
            dragStart: startDateObject,
            currStart: startDateObject,
            currEnd: startDateObject.add(rect.height / standardHeight / 2),
            totalViewTop: totalViewRect.top
        })
    }

    const handleMouseMoveOnMoving = (e: MouseEvent, props: any) => {

        if (focused === null) {
            return;
        }
        const block = blocks ? blocks[focused] : null;
        if (!block) {
            return;
        }

        let rect: HTMLDivElement = e.target as HTMLDivElement;
        const isEmptyEventSlot = rect.dataset.type === 'emptyEvent';
        const rectDOM: DOMRect = (rect as HTMLDivElement).getBoundingClientRect();


        if (!block || !block.dragDay) {
            setMode(null);
            // NEED BACK - removeBlock();
            return;
        }

        if (props.hoverOverPreview) {
            const newStart = block.dragStart.add((e.pageY - block.startY) / standardHeight / 2);
            updateBlock({
                ...block,
                display: 'flex',
                top: e.pageY,
                currY: e.pageY,
                currStart: newStart,
                currEnd: newStart.add(block.height / standardHeight / 2)
            })
        }

        const newStart = block.dragStart.add((e.pageY - block.startY) / standardHeight / 2);
        updateBlock({
            ...block,
            display: 'flex',
            top: e.pageY,
            currY: e.pageY,
            dragDay: props.date,
            left: isEmptyEventSlot ? rectDOM.left : block.left,
            currStart: newStart,
            currEnd: newStart.add(block.height / standardHeight / 2)
        })
        return;
    }

    const handleMouseUpOnMoving = async () => {


        if (focused === null) {
            return;
        }
        const block = blocks ? blocks[focused] : null;
        if (!block) {
            return;
        }

        if (!block) return null;

        if (block.startY === block.currY) {
            setMode(null);
            // removeBlock();
            return null;
        }

        if (!block.uuid) {
            setMode(null);
            // removeBlock();
            return null;
        }

        await handleUpOnMove(block)
        // removeBlock();
        setMode(null);
        return;
    }


    const handleMouseMove = (e: MouseEvent, props: any) => {

        if (focused === null) {
            return;
        }
        const block = blocks ? blocks[focused] : null;
        if (!block) {
            return;
        }


        if (!mode) return;
        // console.log(e.target)

        if (mode === DragMode.Paused) return;
        if (mode === DragMode.Moving) return handleMouseMoveOnMoving(e, props);

        let target: HTMLDivElement = e.target as HTMLDivElement;

        // if (target.tagName === "SPAN") {
        //     return;
        // }

        // if (target.dataset.type !== 'emptyEvent') {
        //     return handleStartDragToMove(e, props);
        // }

        while (target.dataset.type !== 'dragging_interface_top') {
            if (target.parentElement === null) {
                return;
            }
            console.log(target);
            target = target.parentElement as HTMLDivElement;
        }

        console.log(target);

        if (!target) {
            return;
        }

        const yRelative = e.clientY - target.getBoundingClientRect().top + target.scrollTop;

        if (mode === DragMode.AdjustByTop) {

            const height = yRelative - block.startY;

            updateBlock({
                ...block,
                dragEndDay: props.date || block.dragEndDay,
                startY: yRelative,
                top: yRelative
            })

            return;
        }

        const height = yRelative - block.startY;
        updateBlock({
            ...block,
            height,
            dragEndDay: props.date || block.dragEndDay,
            currY: yRelative,
            currEnd: block.dragStart.add(height / standardHeight / 2)
        })

        return;
    }

    const handleMouseUp = () => {

        if (mode === DragMode.Moving) return handleMouseUpOnMoving();

        // if (mode !== DragMode.DragToCreate) {
        //     setBlock(null);
        //     return;
        // };

        setMode(DragMode.Paused);
        // handleUpOnCreate(block)
        // setBlock(null);
        // setMode(null);
        return;
    }


    const RenderedBlock = (
        <div
            onMouseMove={(e) => handleMouseMove(e, { hoverOverPreview: true })}
        >
            {blocks && blocks.map((block, i) => {


                return (
                    <div
                        id={`moving_event_block_${i}`}
                        key={`moving_event_block_${i}`}
                        className="event-block"
                        style={{
                            display: block.display,
                            position: 'absolute',
                            zIndex: 2,
                            border: `0.15rem solid ${alpha(theme.palette.primary.main, 0.5)}`,
                            top: block ? `${block.top}px` : 0,
                            width: block ? block.width : 0,
                            height: block ? block.height : 0,
                            left: block ? block.left : 0,
                            borderRadius: '0.25rem',
                            padding: '0.5rem',
                            color: theme.palette.primary.main,
                            backgroundColor: theme.palette.background.paper,
                        }}
                    >
                        <span style={{ fontSize: '0.75rem', margin: 0, height: "fit-content" }}>
                            {block.name && <><span style={{ fontWeight: 700 }}>{block.name && block.name}</span> <br /></>}
                            {block.currStart.to(block.currEnd, 5)}
                        </span>

                        <>
                            <div
                                onMouseDown={e => {
                                    setFocused(i)
                                    setMode(DragMode.DragToCreate)
                                }}
                                onMouseUp={e => setMode(DragMode.Paused)}
                                className="flex center middle fit" style={{
                                    position: 'absolute',
                                    width: "0.75rem",
                                    height: "0.75rem",
                                    backgroundColor: theme.palette.background.paper,
                                    // padding: "0.25rem",
                                    borderRadius: '100vh',
                                    bottom: "-0.45rem",
                                    left: "50%",
                                    transform: 'translateX(-50%)',
                                    cursor: "ns-resize",
                                }}>
                                <div style={{
                                    width: "0.5rem",
                                    borderRadius: '100vh',
                                    height: "0.5rem",
                                    backgroundColor: theme.palette.background.paper,
                                    border: `0.15rem solid ${theme.palette.primary.main}`,
                                }}></div>
                            </div>
                            <div
                                onMouseDown={e => {
                                    setFocused(i)
                                    setMode(DragMode.AdjustByTop)
                                }}
                                onMouseUp={e => setMode(DragMode.Paused)}
                                className="flex center middle fit" style={{
                                    position: 'absolute',
                                    width: "0.75rem",
                                    height: "0.75rem",
                                    backgroundColor: theme.palette.background.paper,
                                    // padding: "0.25rem",
                                    borderRadius: '100vh',
                                    top: "-0.45rem",
                                    left: "50%",
                                    transform: 'translateX(-50%)',
                                    cursor: "ns-resize",
                                }}>
                                <div style={{
                                    width: "0.5rem",
                                    borderRadius: '100vh',
                                    height: "0.5rem",
                                    backgroundColor: theme.palette.background.paper,
                                    border: `0.15rem solid ${theme.palette.primary.main}`,
                                }}></div>
                            </div>

                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,

                            }}>
                                <IconButton onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    removeBlock(i);
                                    setMode(null);
                                }} >
                                    <CloseOutlined sx={{
                                        fontSize: '0.875rem'
                                    }} />
                                </IconButton>
                            </div>

                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,

                            }}>
                                <Button size="small" onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleUpOnCreate()
                                    // removeBlock(i);
                                    // setMode(null);
                                }}
                                    startIcon={<AddOutlined sx={{
                                        fontSize: "0.75rem",
                                        marginRight: "-0.25rem"
                                    }}
                                    />
                                    }
                                >
                                    Create
                                </Button>
                            </div>
                        </>
                    </div>
                )
            })}
        </div>
    )




    return { blocks, RenderedBlock, handleDragStart, handleMouseMove, handleMouseUp }
}