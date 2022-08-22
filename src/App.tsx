import { createContext, useContext, useEffect, useState } from "react";
import YAML from "yaml";
import Editor from "@monaco-editor/react";
import MDEditor from "@uiw/react-md-editor";

interface Event {
    title: string;
    tags: string[];
}

interface Chapter {
    title: string;
    events: Event[];
}
interface Journey {
    title: string;
    description: string;
    chapters: Chapter[];
}

type journeyContextData = {
    data: Journey;
    notes: string;
    updateData(new_value: string): void;
    updateNotes(new_value: string): void;
};

const journeyContext = createContext({} as journeyContextData);

const useJourney = () => {
    return useContext(journeyContext);
};

const JourneyProvider = ({ children }: any) => {
    const [journey, setJourney] = useState(JOURNEY_JSON);
    const [notes, setNotes] = useState("");

    const value = {
        data: journey,
        notes,
        updateData: (new_value: string) => {
            try {
                // setJourney(JSON.parse(new_value));
                const parsed_data = YAML.parse(new_value);
                setJourney(parsed_data as Journey);
            } catch (e) {
                console.error(e);
            }
        },
        updateNotes: (new_value: string) => {
            try {
                setNotes(new_value);
            } catch (e) {
                console.error(e);
            }
        },
    };

    return (
        <journeyContext.Provider value={value}>
            {children}
        </journeyContext.Provider>
    );
};

function App() {
    return (
        <JourneyProvider>
            <div className="flex flex-col w-screen h-screen bg-slate-100">
                <JourneyHeader />
                <main className="flex flex-row grow">
                    <JourneyEditor />
                    <div className="w-2 cursor-move bg-slate-300 hover:bg-slate-700 hover:shadow-lg" />
                    <div className="flex flex-col grow">
                        <JourneyMap />
                        <TechnicalNotes />
                    </div>
                </main>
            </div>
        </JourneyProvider>
    );
}

const JourneyHeader = () => {
    const handler = useJourney();
    const journey = handler.data;

    return (
        <header className="p-1 mb-1 text-center text-white bg-slate-700">
            <h1 className="text-xl font-bold">{journey.title}</h1>
            <p className="text-sm font-light">{journey.description}</p>
        </header>
    );
};

const JourneyEditor = () => {
    const handler = useJourney();
    const journey = handler.data;

    function handleEditorChange(value: string | undefined, event: any) {
        // console.log("here is the current model value:", value, "| type:", typeof(event));
        if (typeof value === "string") {
            handler.updateData(value);
        }
    }

    return (
        <div className="flex flex-col text-black border-r-4 border-slate-300 basis-3/5">
            <div className="px-1 text-lg font-bold text-white bg-slate-500">
                Descriptor
            </div>
            <Editor
                defaultLanguage="yaml"
                defaultValue={YAML.stringify(journey)}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{ fontSize: 12, minimap: { enabled: false } }}
            />
        </div>
    );
};

const TechnicalNotes = () => {
    const handler = useJourney();
    const notes = handler.notes;

    useEffect(() => {
        const fetchData = async () => {
            const text = await loadMDExample();
            handler.updateNotes(text);
        };

        fetchData().catch(console.error);
    }, []);

    function update(value: string | undefined) {
        if (typeof value === "string") {
            handler.updateNotes(value);
        }
    }

    return (
        <div className="flex flex-col p-2 mt-4 border-t-2 border-dashed grow">
            <h1 className="px-1 text-lg font-bold text-white bg-slate-500">
                Notes
            </h1>
            {/* <Editor defaultLanguage="markdown" defaultValue="# Hello!!!" theme="vs-dark" options={{fontSize:12,minimap:{enabled:false}}} /> */}
            <MDEditor value={notes} onChange={update} className="grow" />
            {/* <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} /> */}
        </div>
    );
};

const JourneyMap = () => {
    const handler = useJourney();
    const journey = handler.data;

    return (
        <div className="flex gap-1 justify-evenly">
            {journey.chapters &&
                journey.chapters.map((chapter, idx) => {
                    return (
                        <div
                            key={idx}
                            className={`w-full pl-2 pr-1 ${
                                idx > 0 ? "border-l-2" : ""
                            }`}
                        >
                            <h1 className="px-1 text-lg font-bold text-white border-b-2 rounded-md border-b-slate-300 bg-slate-500">
                                {chapter.title}
                            </h1>
                            <div className="flex flex-wrap justify-center">
                                {chapter.events &&
                                    chapter.events.map((evt, idx) => {
                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col justify-between p-2 m-2 bg-white shadow-lg text-slate-900 w-60"
                                            >
                                                <span className="text-sm">
                                                    {evt.title}
                                                </span>
                                                <div className="flex justify-between gap-1 mt-1 text-xs text-center">
                                                    <div className="flex gap-1">
                                                        {evt.tags &&
                                                            evt.tags.map(
                                                                (tag, idx) => {
                                                                    return (
                                                                        <span
                                                                            className="px-1 text-white bg-blue-700 rounded-md"
                                                                            key={
                                                                                idx
                                                                            }
                                                                        >
                                                                            {
                                                                                tag
                                                                            }
                                                                        </span>
                                                                    );
                                                                }
                                                            )}
                                                    </div>
                                                    <span
                                                        className="w-4 h-4 font-light text-white bg-indigo-900 rounded-full opacity-80"
                                                        key={idx}
                                                    >
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

const JOURNEY_JSON = {
    title: "Fake Journey",
    description: "This is a description of the Fake journey.",
    chapters: [
        {
            title: "Chapter 1",
            events: [
                {
                    title: "Keycloak login page is shown.",
                    tags: ["Keycloak"],
                },
                {
                    title: "The user fills in its credentials and fires login.",
                    tags: ["User"],
                },
                {
                    title: "Keycloak validates the user's credentials and then verifies if the user exists in its database.",
                    tags: ["Keycloak"],
                },
                {
                    title: "If the user doesn't exist, Keycloak will request the User's data to AC Cloud api.auth2 backend.",
                    tags: ["Keycloak", "Python backend"],
                },
            ],
        },
        {
            title: "Chapter 2",
            events: [
                {
                    title: "Chapter 2, event A",
                    tags: [],
                },
                {
                    title: "Chapter 2, event B",
                    tags: [],
                },
                {
                    title: "Chapter 2, event C",
                    tags: [],
                },
            ],
        },
        {
            title: "Chapter 3",
            events: [
                {
                    title: "Chapter 3, event A",
                    tags: [],
                },
                {
                    title: "Chapter 3, event B",
                    tags: [],
                },
                {
                    title: "Chapter 3, event C",
                    tags: [],
                },
                {
                    title: "Chapter 3, event D",
                    tags: [],
                },
            ],
        },
    ],
};

const JOURNEY_YAML = `
title: Fake Journey
description: This is a description of the Fake journey.
chapters:
- title: Chapter 1
  events:
  - title: Keycloak login page is shown.
    tags:
    - Keycloak
  - title: The user fills in its credentials and fires login.
    tags:
    - User
  - title: Keycloak validates the user's credentials and then verifies if the user
      exists in its database.
    tags:
    - Keycloak
  - title: If the user doesn't exist, Keycloak will request the User's data to AC
      Cloud api.auth2 backend.
    tags:
    - Keycloak
    - Python backend
- title: Chapter 2
  events:
  - title: Chapter 2, event A
    tags: []
  - title: Chapter 2, event B
    tags: []
  - title: Chapter 2, event C
    tags: []
- title: Chapter 3
  events:
  - title: Chapter 3, event A
    tags: []
  - title: Chapter 3, event B
    tags: []
  - title: Chapter 3, event C
    tags: []
  - title: Chapter 3, event D
    tags: []
`;
for (let i = 0; i < 3; i++) {}

async function loadMDExample() {
    const response = await fetch("/examples/ex1.md");
    return await response.text();
}

export default App;
