"use client"
import { AppPageProps } from "@/types/globals";
import { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";
import Divider, { DIVIDER_NO_ALPHA_COLOR } from "./Divider";
import Footer from "./layout/Footer";
import Header from "./layout/Header";
import Sidebar, { SIDEBAR_WIDTH } from "./layout/Sidebar";
import { UseSession } from "@/lib/global/useSession";
import { UseBase } from "@/lib/global/useBase";
import { Member, MemberFactory, Profile } from "@/schema";
import { useRouter } from "next/router";
import { Typography, useTheme, CircularProgress } from "@mui/material";
import useIAM from "@/lib/global/useIAM";
import { useSnackbar } from "notistack";
import Module from "module";


export default function AppLayout(props: {
    Session: UseSession & {
        session: Profile
    },
    Base?: UseBase,
    Module?: UseBase,
    module?: Member;
    setModule?: Dispatch<SetStateAction<Member | null>>,
    children: JSX.Element
}) {

    const theme = useTheme();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const Session = props.Session;
    const Base = props.Base;
    const Module = props.Module;

    const [cache, setCache] = useState<{
        session: string,
        base: string | null,
        module: string | null
    } | null>(null);

    useEffect(() => {

        if (!router) {
            return
        }

        if (router.query.integrationSuccessful) {
            const { integrationSuccessful, ...restQuery } = router.query;

            if (integrationSuccessful) {
                router.replace(
                    {
                        pathname: router.pathname,
                        query: restQuery,
                    },
                    undefined,
                    { shallow: true }
                );
            }
            enqueueSnackbar("Success! We got a new integration for you.", {
                variant: "success"
            })
        }

        if (cache) {
            const isBaseMatching = !Session.base ? !cache.base : cache.base === Session.base!.id();
            if (isBaseMatching && ((!cache.module && !router.query.module) || (cache.module === router.query.module))) {
                return;
            }
        }

        console.log({
            cache,
            query: router.query
        })

        if ((Base && props.setModule) && (router.query.module && router.query.base)) {
            Base.Events.get(String(router.query.module))
                .then(async (res) => {
                    if (!res) {
                        return;
                    }

                    await MemberFactory.login(res, Session.base!);
                    await MemberFactory.fetchMetadata(res);
                    props.setModule!(res);
                    setCache({
                        session: Session.session.id(),
                        base: Session.base!.id(),
                        module: res.id()
                    });
                })
        }
        else if (Session.base && Session.session) {
            if (props.setModule) {
                props.setModule(null);
            }
            setCache({
                session: Session.session.id(),
                base: Session.base.id(),
                module: null
            })
        }
        else if (Session.session) {
            setCache({
                session: Session.session.id(),
                base: null,
                module: null
            })

        }
        else {
            alert("No session or no base")
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Session.session, Session.base, module, router.asPath])

    if (!cache || (cache.module && (!props.Module || props.Module.loading))) {
        return (
            <div className='column center middle' style={{
                height: "100vh",
                width: "100vw",
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper
            }}>
                <CircularProgress sx={{ color: theme.palette.text.primary }} />
                <Typography variant="caption">Belong Platforms LLC. 2025</Typography>
                <Typography>{JSON.stringify(cache)}</Typography>
                <Typography>Module: {router.query.module}</Typography>
                <Typography>Base: {router.query.module}</Typography>
                <Typography>Blocked by App Layout</Typography>
            </div>
        )
    }

    return (
        <>
            <div className="flex snug" style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary
            }}>
                <Sidebar
                    Session={Session}
                    Base={Base}
                    Module={props.Module}
                    module={props.module}
                    setModule={props.setModule}
                />
                <Divider vertical sx={{
                    height: "100vh"
                }} />
                <div className="column snug" style={{
                    marginLeft: !Session.Preferences.isSidebarDocked ? '0rem' : `calc(${SIDEBAR_WIDTH} - 0.1rem)`,
                    width: !Session.Preferences.isSidebarDocked ? "100%" : `calc(100% - ${SIDEBAR_WIDTH})`,
                    borderRight: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                }}>
                    <div
                        className="column snug"
                        style={{
                            position: 'fixed',
                            width: !Session.Preferences.isSidebarDocked ? "100%" : `calc(100% - ${SIDEBAR_WIDTH})`,
                            zIndex: 1
                        }}>
                        <Divider sx={{
                            height: "0.05rem"
                        }} />
                        <Header
                            Session={Session}
                            Base={Base}
                            Module={props.Module}
                            module={props.module}
                        />
                    </div>
                    <div id="content"
                        className="column"
                        style={{
                            padding: "3.5rem 0 2.5rem 0",
                            height: "100vh",
                            // height: "calc(100vh - 6.6rem)",
                            zIndex: 0,
                            // backgroundColor: 'lightGrey',
                        }}>
                        <div className="column" style={{
                            position: 'relative',
                            height: '100%',
                            overflowY: 'scroll',
                            overflowX: 'hidden'
                        }}>
                            {props.children}
                        </div>
                    </div>
                    <Footer
                        Session={Session}
                        Base={Base}
                        Module={props.Module}
                        module={props.module}
                    />
                </div>
            </div>

            {Session.Creator.CreateForm}
            <>
                {Base?.Creator.CreateForm}
            </>
            <>
                {Base?.Viewer.EventPopover}
            </>

            <>
                {Module && (
                    <>
                        {Module.Creator.CreateForm}
                        <>
                            {Module.Viewer.EventPopover}
                        </>
                    </>
                )}
            </>


        </>
    )
}