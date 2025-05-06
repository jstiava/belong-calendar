"use client"
import { StartCreator } from "@/lib/global/useCreate";
import { UseEvents } from "@/lib/global/useEvents";
import Chronos from "@/lib/utils/chronos";
import { EventData } from "@/schema";
import { Mode, Type } from "@/types/globals";
import { RectangleTwoTone } from "@mui/icons-material";
import { alpha, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { useState, MouseEvent } from "react";
import { v4 as uuidv4 } from "uuid";


export enum DragMode {
    Moving = "moving",
    DragToCreate = "dragToCreate",
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
}

export default function useDraggableEventBlock(
    standardHeight: number,
    topAdjustmentRef: any | null = null,
    handleUpOnMove: (props: any) => Promise<void>,
    handleUpOnCreate: (props: any) => Promise<void>
) {

    const theme = useTheme();

    const [block, setBlock] = useState<DraggedEventBlockProps | null>(null);
    const [mode, setMode] = useState<DragMode | null>(null);

    const handleStartDragToMove = (
        e: MouseEvent,
        props: any
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

        setBlock(newEventBlock)
        setMode(DragMode.Moving);
        return;
    }


    const handleDragStart = (
        e: MouseEvent,
        props: any,
    ) => {

        const RIGHT_CLICK = 2;
        if (e.button === RIGHT_CLICK) {
            return;
        }

        if (!e.target) return;
        let target: HTMLDivElement = e.target as HTMLDivElement;
        if (target.dataset.type !== 'emptyEvent') {
            return handleStartDragToMove(e, props);
        }
        
        const dayElement = target.parentElement;
        const dayContainer = dayElement?.parentElement;
        const totalView = dayContainer?.parentElement;
        
        console.log(target);

        const rect: DOMRect = target.getBoundingClientRect();
        const totalViewRect= totalView?.getBoundingClientRect();

        if (!totalViewRect) {
            return;
        }

        const isClosestToTop = rect.top - e.clientY < e.clientY - rect.bottom;
        setMode(DragMode.DragToCreate)

        const startDateObject = isClosestToTop ? new Chronos(props.time) : new Chronos(props.time - 0.5);

        console.log(topAdjustmentRef);
        // const adjustedTop = (isClosestToTop ? rect.bottom : rect.top) + (topAdjustmentRef ? topAdjustmentRef.current.scrollHeight : window.scrollY);
        const adjustedTop = (isClosestToTop ? rect.bottom : rect.top) - totalViewRect.top;
        const adjustedLeft = rect.left - totalViewRect.left;

        setBlock({
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
            currEnd: startDateObject.add(rect.height / standardHeight / 2)
        })
    }

    const handleMouseMoveOnMoving = (e: MouseEvent, props: any) => {

        let rect: HTMLDivElement = e.target as HTMLDivElement;
        const isEmptyEventSlot = rect.dataset.type === 'emptyEvent';
        const rectDOM: DOMRect = (rect as HTMLDivElement).getBoundingClientRect();


        if (!block || !block.dragDay) {
            setMode(null);
            setBlock(null);
            return;
        }

        if (props.hoverOverPreview) {
            setBlock((prev) => {
                if (!prev) return null;

                const newStart = prev.dragStart.add((e.pageY - prev.startY) / standardHeight / 2);
                return {
                    ...prev,
                    display: 'flex',
                    top: e.pageY,
                    currY: e.pageY,
                    currStart: newStart,
                    currEnd: newStart.add(prev.height / standardHeight / 2)
                }
            })

            return;
        }

        setBlock((prev) => {
            if (!prev) return null;

            const newStart = prev.dragStart.add((e.pageY - prev.startY) / standardHeight / 2);
            return {
                ...prev,
                display: 'flex',
                top: e.pageY,
                currY: e.pageY,
                dragDay: props.date,
                left: isEmptyEventSlot ? rectDOM.left : prev.left,
                currStart: newStart,
                currEnd: newStart.add(prev.height / standardHeight / 2)
            }
        })
        return;
    }

    const handleMouseUpOnMoving = async () => {
        if (!block) return null;

        if (block.startY === block.currY) {
            setMode(null);
            setBlock(null);
            return null;
        }

        if (!block.uuid) {
            setMode(null);
            setBlock(null);
            return null;
        }

        await handleUpOnMove(block)
        setBlock(null);
        setMode(null);
        return;
    }


    const handleMouseMove = (e: MouseEvent, props: any) => {
        if (!mode) return;
        // console.log(e.target)

        if (mode === DragMode.Moving) return handleMouseMoveOnMoving(e, props);

        let target: HTMLDivElement = e.target as HTMLDivElement;

        if (target.tagName === "SPAN") {
            return;
        }

        if (target.dataset.type !== 'emptyEvent') {
            return handleStartDragToMove(e, props);
        }

        while (!target.classList.contains('event-block') && target.dataset.type != 'emptyEvent') {
            if (target.parentElement === null) {
                return;
            }
            target = target.parentElement as HTMLDivElement;
        }
        const rect: DOMRect = (target as HTMLDivElement).getBoundingClientRect();
        const dayElement = target.parentElement;
        const dayContainer = dayElement?.parentElement;
        const totalView = dayContainer?.parentElement;
        const totalViewRect= totalView?.getBoundingClientRect();

        if (!totalViewRect) {
            return;
        }

        const adjustedTop = rect.bottom - totalViewRect.top;

        if (topAdjustmentRef) {

            setBlock((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    height: prev.currY - adjustedTop,
                    dragEndDay: props.date || prev.dragEndDay,
                    currY: adjustedTop,
                    currEnd: prev.dragStart.add((prev.startY) / standardHeight / 2),
                };
            })

            return;
        }

        setBlock((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                height: e.pageY - prev.startY,
                dragEndDay: props.date || prev.dragEndDay,
                currY: e.pageY,
                currEnd: prev.dragStart.add((e.pageY - prev.startY) / standardHeight / 2)
            }
        })

        return;
    }

    const handleMouseUp = () => {
        if (!block) return;

        if (mode === DragMode.Moving) return handleMouseUpOnMoving();

        if (mode !== DragMode.DragToCreate) {
            setBlock(null);
            return;
        };

        handleUpOnCreate(block)
        setBlock(null);
        setMode(null);
        return;
    }


    const RenderedBlock = (
        <>
            {block ? (
                <div
                    onMouseMove={(e) => handleMouseMove(e, { hoverOverPreview: true })}
                    key="moving-event-block"
                    className="event-block"
                    style={{
                        display: block.display,
                        position: 'absolute',
                        zIndex: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.5),
                        top: block ? `${block.top}px` : 0,
                        width: block ? block.width : 0,
                        height: block ? block.height : 0,
                        left: block ? block.left : 0,
                        borderRadius: '0.25rem',
                        padding: '0.5rem',
                        color: theme.palette.primary.contrastText,
                    }}
                >
                    <span style={{ fontSize: '0.75rem', margin: 0, height: "fit-content" }}>
                        {block.name && <><span style={{ fontWeight: 700 }}>{block.name && block.name}</span> <br /></>}
                        {block.currStart.to(block.currEnd, 5)}
                    </span>
                </div>
            ) : (
                <></>
            )}
        </>
    )




    return { block, RenderedBlock, handleDragStart, handleMouseMove, handleMouseUp }
}