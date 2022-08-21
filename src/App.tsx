import { createContext, useContext, useState } from "react";

interface Event {
    title: string;
    actors: string[];
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
    update(new_value: string): void;
};

const journeyContext = createContext({} as journeyContextData);

const useJourney = () => {
    return useContext(journeyContext);
};

const JourneyProvider = ({ children }: any) => {
    const [journey, setJourney] = useState(JOURNEY);

    const value = {
        data: journey,
        update: (new_value: string) => {
            try {
                setJourney(JSON.parse(new_value));
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
                    <Editor />
                    <div className="w-2 cursor-move bg-slate-300 hover:bg-slate-700 hover:shadow-lg"/>
                    <div className="flex flex-col">
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
        <header className="p-2 text-center text-white bg-slate-700">
            <h1 className="text-xl font-bold">{journey.title}</h1>
            <p className="mt-1 text-sm font-light">{journey.description}</p>
        </header>
    );
};

const Editor = () => {
    const handler = useJourney();
    const journey = handler.data;

    return (
        <div className="flex flex-col text-black border-r-4 border-slate-300 basis-1/3">
            <div className="text-lg text-white bg-slate-500">TOOLBAR</div>
            <textarea
                className="text-sm resize-none grow"
                value={JSON.stringify(journey, null, 4)}
                onChange={(evt) => handler.update(evt.target.value)}
            />
        </div>
    );
};

const TechnicalNotes = () => {
    return (
        <div className="p-2 mt-4 border-t-2 border-dashed text-slate-700 grow">
            <h1 className="text-lg font-bold text-slate-700">
                Technical notes
            </h1>
        </div>
    );
};

const JourneyMap = () => {
    const handler = useJourney();
    const journey = handler.data;

    return (
        <div className="flex gap-1 justify-evenly basis-3/4">
            {journey.chapters.map((chapter, idx) => {
                return (
                    <div
                        key={idx}
                        className={`w-full pl-2 pr-1 ${idx > 0 ? "border-l-2" : ""}`}
                    >
                        <h1 className="px-1 text-lg font-bold text-white border-b-2 rounded-md border-b-slate-300 bg-slate-500">
                            {chapter.title}
                        </h1>
                        <div className="flex flex-wrap justify-center">
                            {chapter.events.map((evt, idx) => {
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
                                                {evt.actors.map(
                                                    (actor, idx) => {
                                                        return (
                                                            <span
                                                                className="px-1 text-white bg-blue-700 rounded-md"
                                                                key={idx}
                                                            >
                                                                {actor}
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

const JOURNEY = {
    title: "Fake Journey",
    description: "This is a description of the Fake journey.",
    chapters: [
        {
            id: 1,
            title: "Chapter 1",
            events: [
                {
                    title: "Keycloak login page is shown.",
                    actors: ["Keycloak"],
                },
                {
                    title: "The user fills in its credentials and fires login.",
                    actors: ["User"],
                },
                {
                    title: "Keycloak validates the user's credentials and then verifies if the user exists in its the database.",
                    actors: ["Keycloak"],
                },
                {
                    title: "If the user doesn't exists, Keycloak will request the User's data to AC Cloud api.auth2 backend.",
                    actors: ["Keycloak", "Python backend"],
                },
            ],
        },
        {
            id: 2,
            title: "Chapter 2",
            events: [
                {
                    id: "2-a",
                    title: "Chapter 2, event A",
                    actors: [],
                },
                {
                    id: "2-b",
                    title: "Chapter 2, event B",
                    actors: [],
                },
                {
                    id: "2-c",
                    title: "Chapter 2, event C",
                    actors: [],
                },
            ],
        },
        {
            id: 3,
            title: "Chapter 3",
            events: [
                {
                    id: "3-a",
                    title: "Chapter 3, event A",
                    actors: [],
                },
                {
                    id: "3-b",
                    title: "Chapter 3, event B",
                    actors: [],
                },
                {
                    id: "3-c",
                    title: "Chapter 3, event C",
                    actors: [],
                },
                {
                    id: "3-d",
                    title: "Chapter 3, event D",
                    actors: [],
                },
            ],
        },
    ],
};

export default App;
