"use client"
import { Button, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import EditorJS from '@editorjs/editorjs';
import { ss3 } from "@/pages/_app";


export interface OutputData {
    "time": number,
    "blocks": any[]
}


export default function Editor({ slug, data }: { slug: string, data: OutputData }) {

    const editorRef = useRef<EditorJS | any>(null);
    const holderRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true); // Prevent SSR crash
    }, []);

    const saveData = async () => {
        if (!editorRef.current) {
            console.log("No editor.")
            return;
        }

        if (!editorRef.current) return;

        try {
            const editor = editorRef.current as EditorJS;
            const output = await editor.save();
            // Send to backend or store locally
            console.log('Saved data:', output);

            await fetch('/api/pages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: output, slug }),
            });

        } catch (err) {
            console.error('Saving failed:', err);
        }

    }

    useEffect(() => {

        if (!isMounted || !holderRef.current || editorRef.current) {
            return;
        }

        const initEditor = async () => {

            const EditorJS = (await import('@editorjs/editorjs')).default;
            const Paragraph = (await import('@editorjs/paragraph')).default;
            const MentionTool = (await import('editorjs-mention-tool')).default;

            const editor = new EditorJS({
                holder: holderRef.current as any,
                onReady() {
                    const editor = document.querySelector('.ce-block__content');
                    if (editor) {
                        editor.addEventListener('keydown', (e) => {
                            const keyEvent = e as KeyboardEvent;
                            if (keyEvent.key === 'Enter') {
                                e.preventDefault(); // Prevents newline
                            }
                        });
                    }
                },
                tools: {
                    paragraph: {
                        class: Paragraph as any,
                        inlineToolbar: true,
                        config: {
                            preserveBlank: true,

                        },
                    },
                },
                onChange: (api, event) => {
                    console.log({
                        api, event
                    })
                },
                autofocus: true,
                data,
            });


            new MentionTool({
                holder: 'editorjs',
                accessKey: "$", // Access key ( $ or @ )
                allUsers: [ // The array with the data you want to show when the users type $
                    {
                        "id": "1234",
                        "name": "Variable 1",
                        "slug": "variable1"
                    },
                    {
                        "id": "12345",
                        "name": "Thing of v1",
                        "slug": "variable1.something"
                    },
                ],
                baseUrl: '',
                searchAPIUrl: ''
            })

            // // Here create new MentionTool with @ accessor key to use it as mention layout
            // new MentionTool({
            //     holder: 
            //     accessKey: "@", // Access key ( $ or @ )
            //     allUsers: [ // The array with the data you want to show when the users type @
            //         {
            //             "id": "21029",
            //             "name": "Kyle Ockford",
            //             "avatar": "https://i.pravatar.cc/300",
            //             "slug": "kyleockford"
            //         },
            //         {
            //             "id": "21030",
            //             "name": "Paige Cortez",
            //             "avatar": "https://avatars.dicebear.com/api/croodles/your-custom-seed.svg",
            //             "slug": "paigecortez"
            //         },
            //         {
            //             "id": "21031",
            //             "name": "Nyla Warren",
            //             "slug": "nylawarren"
            //         },
            //         {
            //             "id": "21032",
            //             "name": "Hassan Lee",
            //             "slug": "hassanlee"
            //         },
            //         {
            //             "id": "21033",
            //             "name": "Domas Rivas",
            //             "avatar": "https://avatars.dicebear.com/api/pixel-art-neutral/kreudev.svg",
            //             "slug": "domasrivas"
            //         },
            //         {
            //             "id": "21034",
            //             "name": "Arthur Hunt",
            //             "slug": "arthurhunt"
            //         },
            //     ],
            //     baseUrl: '',
            //     searchAPIUrl: ''
            // })

            editorRef.current = editor;
        };


        if (!editorRef.current) {
            initEditor();
        }

        return () => {
            if (editorRef.current?.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);



    return (
        <div className="column" style={{
            width: "100%"
        }}>
            <div className="flex fit"><Button
                size="small"
                variant="contained"
                onClick={() => {
                    saveData();
                }}>Save</Button></div>
            <div style={{
                fontFamily: [
                    ss3.style.fontFamily,
                    'sans-serif',
                ].join(','),
            }}>

                <div ref={holderRef} id="editorjs" className="editorjs" />
            </div>
        </div>

    )
}