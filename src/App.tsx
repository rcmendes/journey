import { createContext, useContext, useEffect, useState } from "react";
import YAML from "yaml";
import Editor from "@monaco-editor/react";
import MDEditor from "@uiw/react-md-editor";

interface Event {
    title: string;
    tags?: string[];
}

interface Chapter {
    title: string;
    events: Event[];
}
interface JourneyMap {
    title: string;
    description: string;
    chapters: Chapter[];
}

type journeyContextData = {
    updatedAt?: string;
    journeyMap: JourneyMap;
    notes: string;
    updateData(new_value: string): void;
    updateNotes(new_value: string): void;
};

const journeyContext = createContext({} as journeyContextData);

const useJourney = () => {
    return useContext(journeyContext);
};

const JourneyProvider = ({ children }: any) => {
    const [journeyMap, setJourneyMap] = useState(JOURNEY_MAP_JSON);
    const [notes, setNotes] = useState("");

    const value = {
        journeyMap,
        notes,
        updateData: (new_value: string) => {
            try {
                const parsed_data = YAML.parse(new_value);
                setJourneyMap(parsed_data as JourneyMap);
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
                        <JourneyMapContainer />
                        <TechnicalNotes />
                    </div>
                </main>
            </div>
        </JourneyProvider>
    );
}

const Toolbar = () => {
    const handler = useJourney();
    const journeyMap = handler.journeyMap;
    const [filename, setFilename] = useState("");

    const getContent = (): any => {
        const content = {
            version: "0.1",
            updatedAt: new Date().toISOString(),
            journey: journeyMap,
            notes: handler.notes,
        };

        return JSON.stringify(content, null, 4);
    };

    const updateJourney = (text: string, filename: string): void => {
        const jsonData = JSON.parse(text);

        handler.updateData(JSON.stringify(jsonData.journey));
        handler.updateNotes(jsonData.notes);
        setFilename(filename);
    };

    return (
        <nav className="flex flex-row text-white bg-blue-500">
            <div className="flex items-center h-full gap-2 p-2 mr-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-label="download"
                    className="w-8 h-8 p-1 transition duration-300 ease-in-out delay-150 rounded-full hover:scale-110 hover:stroke-2 hover:bg-blue-700"
                    onClick={() => download(getContent())}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                </svg>
                <label>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 p-1 transition duration-300 ease-in-out delay-150 rounded-full hover:scale-110 hover:stroke-2 hover:bg-blue-700"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                    </svg>
                    <input
                        type="file"
                        onChange={(evt) => readFile(evt, updateJourney)}
                        accept=".json"
                        className="hidden"
                    />
                </label>
            </div>
            <div
                className={
                    filename.length > 0
                        ? "w-full ml-2 text-sm font-thin bg-blue-900 grow"
                        : "hidden"
                }
            >
                <div className="px-2">Loaded File:</div>
                <div className="h-full px-2 font-bold bg-blue-700">
                    {filename}
                </div>
            </div>
        </nav>
    );
};

const JourneyHeader = () => {
    const handler = useJourney();
    const { journeyMap } = handler;

    return (
        <header className="flex flex-row text-white bg-slate-700">
            <div className="p-1 mb-1 text-center grow">
                <h1 className="text-xl font-bold">{journeyMap.title}</h1>
                <p className="text-sm font-light">{journeyMap.description}</p>
            </div>
        </header>
    );
};

const JourneyEditor = () => {
    const handler = useJourney();
    const { journeyMap } = handler;

    function handleEditorChange(value: string | undefined, event: any) {
        if (typeof value === "string") {
            handler.updateData(value);
        }
    }

    return (
        <div className="flex flex-col text-black border-r-4 border-slate-300 basis-3/5">
            <Toolbar />
            <div className="px-1 text-lg font-bold text-white bg-slate-500">
                Descriptor
            </div>
            <Editor
                defaultLanguage="yaml"
                value={YAML.stringify(journeyMap)}
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

const JourneyMapContainer = () => {
    const handler = useJourney();
    const { journeyMap } = handler;

    return (
        <div className="flex gap-1 justify-evenly">
            {journeyMap.chapters &&
                journeyMap.chapters.map((chapter, idx) => {
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

const JOURNEY_MAP_JSON = {
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
            ],
        },
        {
            title: "Chapter 3",
            events: [
                {
                    title: "Chapter 3, event A",
                },
                {
                    title: "Chapter 3, event B",
                },
                {
                    title: "Chapter 3, event C",
                },
            ],
        },
    ],
};

async function loadMDExample() {
    const response = await fetch("/examples/ex1.md");
    return await response.text();
}

function getCurrentDateTime(): string {
    const dateNow = new Date();
    return `${dateNow.getFullYear()}-${
        dateNow.getMonth() < 10 ? "0" : ""
    }${dateNow.getMonth()}-${
        dateNow.getDate() < 10 ? "0" : ""
    }${dateNow.getDate()}_at_${
        dateNow.getHours() < 10 ? "0" : ""
    }${dateNow.getHours()}.${
        dateNow.getMinutes() < 10 ? "0" : ""
    }${dateNow.getMinutes()}.${
        dateNow.getSeconds() < 10 ? "0" : ""
    }${dateNow.getSeconds()}`;
}

function download(text: string) {
    const currentDateTime = getCurrentDateTime();
    const filename = `journey_${currentDateTime}.json`;
    var element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

async function readFile(
    event: any,
    updateJourneyFn: (text: string, filename: string) => void
) {
    const file = event.target.files.item(0);

    if (file) {
        console.log(file);
        const text = await file.text();

        updateJourneyFn(text, file.name);
    }
}

export default App;
