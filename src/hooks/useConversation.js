import {
    useState
} from "react";
import {
    mockConversation
} from "../data/mockConversation";
export function useConversation() {
    const [
        messages,
        setMessages
    ] = useState(mockConversation);
    const addMessage = (
        sender,
        text,
        name = ""
    ) => {
        setMessages(
            previous => [
                ...previous,
                {
                    id:
                        Date.now(),
                    sender,
                    name,
                    text,
                    time:
                        new Date()
                            .toLocaleTimeString(
                                [],
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                }
                            )
                }
            ]
        );
    };
    const clearConversation = () => {
        setMessages([]);
    };
    return {
        messages,
        addMessage,
        clearConversation
    };
}