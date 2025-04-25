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
    containerRef: React.RefObject<HTMLElement>,
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

        const newEventBlock: any = {
            uuid: props.uuid,
            display: 'none',
            top: y,
            left: rectDOM.left,
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

        const rect: DOMRect = target.getBoundingClientRect();
        const isClosestToTop = rect.top - e.clientY < e.clientY - rect.bottom;
        setMode(DragMode.DragToCreate)

        const startDateObject = isClosestToTop ? new Chronos(props.time) : new Chronos(props.time - 0.5);

        console.log(topAdjustmentRef);
        // const adjustedTop = (isClosestToTop ? rect.bottom : rect.top) + (topAdjustmentRef ? topAdjustmentRef.current.scrollHeight : window.scrollY);
        const adjustedTop = (isClosestToTop ? rect.bottom : rect.top);

        setBlock({
            uuid: String(uuidv4()),
            display: 'flex',
            top: adjustedTop,
            left: rect.left,
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

        let rect: HTMLDivElement = e.target as HTMLDivElement;

        if (rect.tagName === "SPAN") {
            return;
        }

        while (!rect.classList.contains('event-block') && rect.dataset.type != 'emptyEvent') {
            if (rect.parentElement === null) {
                return;
            }
            rect = rect.parentElement as HTMLDivElement;
        }
        const rectDOM: DOMRect = (rect as HTMLDivElement).getBoundingClientRect();

        if (topAdjustmentRef) {
            const scrollRect = topAdjustmentRef.current.getBoundingClientRect();
            const relativeY = e.clientY + topAdjustmentRef.current.scrollTop;

            setBlock((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    height: relativeY - prev.startY,
                    width: rectDOM.right - prev.left,
                    dragEndDay: props.date || prev.dragEndDay,
                    currY: relativeY,
                    currEnd: prev.dragStart.add((relativeY - prev.startY) / standardHeight / 2),
                };
            })

            return;
        }

        setBlock((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                height: e.pageY - prev.startY,
                width: rectDOM.right - prev.left,
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
                        borderRadius: '0.5rem',
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