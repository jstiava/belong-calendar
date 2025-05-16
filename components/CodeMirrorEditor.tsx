"use client"
import { Button, ButtonBase, Chip, Popper, Typography, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import EditorJS from '@editorjs/editorjs';
import { EditorView, basicSetup } from 'codemirror';
import { EditorSelection, EditorState, RangeSet, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { lineNumbers } from '@codemirror/gutter';
import { DIVIDER_NO_ALPHA_COLOR } from "./Divider";
import { Decoration, DecorationSet, keymap, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { ss3 } from "@/pages/_app";
import StyledIconButton from "./StyledIconButton";
import { CloseOutlined, HandymanOutlined } from "@mui/icons-material";
import Fuse from "fuse.js";
import { placeholder as CodeMirror_Placeholder } from "@codemirror/view";


export interface OutputData {
    "time": number,
    "blocks": any[]
}

export interface EditorVariable {
    "id": string,
    "name": string,
    "slug": string
}


const updateEditorEffect = StateEffect.define<(changes: { from: number, to: number, insert: string }) => void>();

export const removeChipEffect = StateEffect.define<{ from: number; to: number }>();

class ChipWidget extends WidgetType {

    constructor(
        readonly label: string,
        readonly view: EditorView,
        readonly from: number,
        readonly to: number
    ) {
        super();
    }

    // constructor(readonly text: string, private onRemove: () => void) {
    //     super();
    // }

    toDOM(): HTMLElement {
        const div = document.createElement('div');
        div.style.display = 'inline-block',
            div.style.padding = "0 0.25rem";
        div.style.backgroundColor = DIVIDER_NO_ALPHA_COLOR;
        div.style.borderRadius = "0.25rem";
        div.style.width = "fit-content";

        const span = document.createElement("span");
        span.textContent = this.label;
        span.style.fontSize = "1rem";
        span.style.verticalAlign = 'middle',
            span.style.fontFamily = '"Source Sans 3", sans-serif';
        span.style.color = "#000";

        const icon = document.createElement("span");
        icon.className = "material-icons-outlined";
        icon.textContent = "close";
        icon.style.fontSize = "0.875rem";
        icon.style.verticalAlign = 'middle',
            icon.style.cursor = "pointer";
        icon.style.color = "#666";
        icon.style.marginLeft = "0.2rem"

        icon.onclick = (e) => {
            e.stopPropagation();
            console.log({
                message: "Remove",
                from: this.from,
                to: this.to,
                view: this.view
            })
            this.view.dispatch({
                changes: { from: this.from, to: this.to, insert: "" },
                effects: removeChipEffect.of({ from: this.from, to: this.to })
            });
        };

        div.appendChild(span);
        div.appendChild(icon);

        return div;
    }

    ignoreEvent() {
        return false;
    }
}


const chipPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(readonly view: EditorView) {
            this.decorations = this.buildDecorations();
        }

        update(update: ViewUpdate) {
            let deco = this.decorations;

            console.log({
                message: "chipPlugin.update",
                update
            })
            if (update.docChanged) {
                console.log("Rebuild decorations.")
                this.decorations = this.buildDecorations();
                return;
            }

            for (let tr of update.transactions) {
                for (let e of tr.effects) {
                    if (e.is(removeChipEffect)) {
                        // Remove the chip decoration from the specified range
                        deco = deco.update({
                            filter: (from, to, value) => {
                                return !(from === e.value.from && to === e.value.to);
                            }
                        });
                    }
                }
            }

            this.decorations = deco;
        }

        buildDecorations(): DecorationSet {
            const builder = new RangeSetBuilder<Decoration>();
            const regex = /\$\{([^{}]+)\}/g;
            // const regex = /\$\{([^}]+)\}/g;

            for (let i = 0; i < this.view.state.doc.lines; i++) {
                const line = this.view.state.doc.line(i + 1);
                let match;
                while ((match = regex.exec(line.text))) {
                    const [full, inner] = match;
                    const from = line.from + match.index;
                    const to = from + full.length;

                    builder.add(
                        from,
                        to,
                        Decoration.replace({
                            widget: new ChipWidget(inner, this.view, from, to),
                            inclusive: false
                        })
                    );
                }
            }

            return builder.finish();
        }
    },
    {
        decorations: v => v.decorations
    }
);


const CodeMirrorEditor = ({
    initialValue,
    variables,
    placeholder
}: {
    initialValue?: string;
    variables: {
        label: string,
        slug: string,
        isCanBeNull: boolean
    }[];
    placeholder?: string
}) => {

    const theme = useTheme();
    const [isVarPanelOpen, setIsVarPanelOpen] = useState(false);

    const selected = useRef<number>(0);
    const [mirroredSelected, setMirrorSelected] = useState<number>(0);
    const searchQuery = useRef<string | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const cmRef = useRef<EditorView | null>(null);
    const [filtered, setFiltered] = useState(variables);
    const mirroredFiltered = useRef<any[]>([]);
    const cursorRef = useRef<number>(0);

    const fuse = new Fuse(variables, {
        includeScore: true,
        threshold: 0.3,
        keys: ['slug', 'label']
    });

    const handleOpenVarPanel = () => {
        console.log("Open var panel")
        setIsVarPanelOpen(true);
        searchQuery.current = "";
        selected.current = 0;
        setMirrorSelected(0);
        setFiltered(variables);
        mirroredFiltered.current = variables;
    }

    const handleCloseVarPanel = (applySelected = false) => {

        if (searchQuery != null && (applySelected && cmRef.current)) {

            const theSelected = mirroredFiltered.current[selected.current];
            const { from, to } = cmRef.current.state.selection.main;
            const text = `\${${theSelected.slug}}`;

            console.log({
                index: selected.current,
                filtered,
                text,
                theSelected
            })

            const length = (searchQuery.current ? searchQuery.current.length : 0) + 1;
            cmRef.current.dispatch({
                changes: { from: Math.max(0, from - length), to, insert: text },
                selection: { anchor: to - length + text.length },
            });
            // cmRef.current.dispatch({
            //     changes: { from, to, insert: text },
            //     selection: { anchor: from + text.length },
            // });

            cmRef.current.focus();
        }

        setIsVarPanelOpen(false);
        searchQuery.current = null;
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (
            editorRef.current &&
            !editorRef.current.contains(event.target as Node)
        ) {
            handleCloseVarPanel();
            console.log("Clicked outside CodeMirror");
        }
        else {
            console.log("Click found.")
        }
    };


    const handleChangeInput = (letter: string) => {

        const newQuery = searchQuery.current != null ? `${searchQuery.current}${letter}` : null;
        if (!newQuery) {
            return;
        }
        searchQuery.current = newQuery;
        const results = fuse.search(newQuery);
        const final = results.map(x => x.item) || [];
        setFiltered(final);
        mirroredFiltered.current = final;
        setMirrorSelected(0);
        selected.current = 0;
    }


    // Initialize CodeMirror on mount
    useEffect(() => {
        if (editorRef.current && !cmRef.current) {

            const keymaps = keymap.of([
                {
                    key: "Enter",
                    preventDefault: true,
                    run(view: EditorView) {

                        const { state } = view;
                        const pos = state.selection.main.head;
                        handleCloseVarPanel(true);

                        // cmRef.current.focus();

                        return true;
                    }
                },
                {
                    key: 'ArrowUp',
                    preventDefault: true,
                    run(view: EditorView) {
                        selected.current = selected.current - 1;
                        setMirrorSelected(prev => prev - 1)
                        return true;
                    }
                }
            ]);

            const updateEditorState = (changes: { from: number, to: number, insert: string }) => {
                if (cmRef.current) {
                    console.log({
                        message: "Delete variable",
                        changes
                    })
                    cmRef.current.dispatch({
                        changes: changes,
                        effects: updateEditorEffect.of(updateEditorState), // Trigger the effect in the transaction
                    });
                }
            };

            const startState = EditorState.create({
                doc: initialValue ? initialValue : '',
                extensions: [
                    // variableChipField,
                    chipPlugin,
                    keymaps,
                    // autocompletion(),
                    EditorView.lineWrapping,
                    placeholder ? CodeMirror_Placeholder(placeholder) : CodeMirror_Placeholder(''),
                    EditorView.theme({
                        "&": {
                            fontFamily: [ss3.style.fontFamily,
                                'sans-serif'].join(','),
                            backgroundColor: "#fff",
                            color: "#000",
                            border: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                            borderRadius: "0.25rem",
                            padding: "0.25rem",
                        },
                        ".cm-scroller": {
                            fontFamily: 'unset'
                        },
                        ".cm-content": {
                            caretColor: "#000",
                        },
                        ".cm-cursor": {
                            borderLeftColor: "#000"
                        },
                        ".cm-selectionBackground, ::selection": {
                            backgroundColor: "#607d8b33 !important"
                        },
                        ".cm-selectionMatch": {
                            backgroundColor: "#607d8b80"
                        },
                        ".cm-highlight": {
                            borderRadius: "4px",
                            padding: "0 4px",
                            margin: "0 -4px"
                        },
                        ".cm-highlightEmpty": {
                            border: "1px solid #ddd",
                            display: "inline-block",
                            minWidth: "1em",
                            height: "1em",
                            margin: "0 2px",
                            borderRadius: "4px"
                        },
                        ".cm-placeholder": {
                            color: "#888"
                        },
                        ".cm-specialChar": {
                            color: "#888"
                        },
                        ".cm-tooltip": {
                            backgroundColor: "#fff",
                            color: "#000",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxShadow: "0 2px 5px rgba(0,0,0,.1)"
                        },
                        ".cm-completionIcon": {
                            width: "1em",
                            height: "1em",
                            marginRight: "4px",
                            display: "inline-block",
                            verticalAlign: "middle",
                            backgroundImage: "url(data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Cpath d='M41.6663 75H58.333M50 91.6663c23.0186 0 41.6667-18.648 41.6667-41.6663S73.0186 8.33366 50 8.33366 8.33301 26.9817 8.33301 50.0001 26.9814 91.6663 50 91.6663z' stroke='currentColor' stroke-width='6.66667' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E)"
                        },
                        ".cm-completionInfo": {
                            padding: "10px",
                            borderRadius: "4px",
                            backgroundColor: "#f5f5f5",
                            border: "1px solid #ddd",
                            marginTop: "4px"
                        },
                        ".cm-tooltip-autocomplete ul li[aria-selected]": {
                            backgroundColor: "#b0bec5",
                            color: "#fff"
                        },
                        ".cm-tooltip-autocomplete ul li": {
                            padding: "2px 8px",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }
                    }),
                    EditorView.domEventHandlers({
                        'input': (event, view) => {
                            console.log(view.contentDOM.textContent);
                            // console.log(event);
                            const newValue = view.contentDOM.textContent;
                        },
                        'keydown': (event, view) => {

                            if (event.key === 'Backspace') {
                                // event.preventDefault();
                                const cursor = view.state.selection.main.head;
                                handleCloseVarPanel();
                            }
                            else if (event.key === '.') {
                                const cursor = view.state.selection.main.head;
                                cursorRef.current = cursor + 1;
                                console.log(variables)
                                handleOpenVarPanel();

                                return;
                            }
                            else if (event.key === " ") {
                                const cursor = view.state.selection.main.head;
                                cursorRef.current = cursor + 1;
                                handleCloseVarPanel();

                                return;
                            }
                            else if (event.key === "ArrowDown") {
                                selected.current = selected.current + 1;
                                setMirrorSelected(prev => prev + 1)

                                return;
                            }
                            else if (event.key === 'Delete') {
                                const cursor = view.state.selection.main.head;
                                cursorRef.current = cursor;
                                return;
                            }
                            else {
                                const cursor = view.state.selection.main.head;
                                cursorRef.current = cursor + 1;
                                handleChangeInput(event.key);
                            }
                        }
                    }),
                ],
            });

            if (isVarPanelOpen) {
                document.addEventListener("mousedown", handleClickOutside);
            }

            cmRef.current = new EditorView({
                state: startState,
                parent: editorRef.current,
            });

            cmRef.current.dispatch({
                changes: { from: 0, to: cmRef.current.state.doc.length, insert: cmRef.current.state.doc.toString() },
            });

            // Cleanup on unmount
            return () => {
                if (cmRef.current) {
                    cmRef.current.destroy();
                    cmRef.current = null;
                }
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [initialValue]);


    return (
        <div className="flex snug" style={{
            width: "100%"
        }}>

            <div ref={editorRef} className="codemirror-container" style={{
                width: "100%",
                position: 'relative'
            }}>
                <div style={{
                    position: "absolute",
                    top: "0rem",
                    right: "0rem",
                    zIndex: 1000
                }}>
                    <StyledIconButton
                        title="Variables"
                        onClick={() => {
                            handleOpenVarPanel()
                        }}
                    >
                        <HandymanOutlined
                            sx={{
                                fontSize: '1rem',
                                color: 'grey'
                            }} />
                    </StyledIconButton>
                </div>
            </div>


            <Popper
                open={isVarPanelOpen}
                anchorEl={editorRef.current}
                placement="top-start"
                disablePortal
                sx={{
                    paddingBottom: '0.5rem',
                    zIndex: 1000,
                    width: "20rem"
                }}
            >
                <div className="column snug" style={{
                    position: 'relative',
                    backgroundColor: 'whitesmoke',
                    padding: "2.5rem 0.5rem 0.5rem 0.5rem",
                    borderRadius: '0.25rem',
                    boxShadow: theme.shadows[1]
                }}>
                    <div style={{
                        position: "absolute",
                        top: "0rem",
                        right: "0rem"
                    }}>
                        <StyledIconButton
                            title="Close"
                            onClick={() => {
                                handleCloseVarPanel()
                            }}
                        >
                            <CloseOutlined sx={{
                                fontSize: '1rem'
                            }} />
                        </StyledIconButton>
                    </div>


                    {isVarPanelOpen && filtered.map((x, i) => {
                        return (
                            <ButtonBase
                                key={x.slug}
                                className={"flex between"}
                                onClick={e => {

                                    if (!cmRef.current) {
                                        return;
                                    }
                                    const { from, to } = cmRef.current.state.selection.main;

                                    const text = `\${${x.slug}}`;

                                    console.log({
                                        message: "Enter found",
                                        text
                                    });

                                    cmRef.current.dispatch({
                                        changes: { from, to, insert: text },
                                        selection: { anchor: from + text.length },
                                    });

                                    handleCloseVarPanel()
                                }}
                                sx={{
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: '0.25rem',
                                    backgroundColor: i === mirroredSelected ? 'white' : 'transparent'
                                }}>
                                <div className="flex fiti">
                                    <Typography sx={{
                                        fontSize: "0.875rem"
                                    }}>{x.label}</Typography>
                                </div>
                                <div className="flex fit">
                                    <Typography variant="caption">{x.slug}</Typography>
                                </div>
                            </ButtonBase>
                        )
                    })}
                </div>
            </Popper>
        </div>
    );
};

export default CodeMirrorEditor;