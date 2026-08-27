import {
    MessageSquare,
    Bot,
    UserRound
} from "lucide-react";
function Conversation({
    messages = []
}) {
    const safeMessages = Array.isArray(messages) ? messages : [];
    return (
        <section className="conversation-panel">
            <div className="panel-title">
                <div>
                    <span>
                        LIVE
                    </span>
                    <h2>
                        Conversation
                    </h2>
                </div>
                <MessageSquare
                    size={17}
                />
            </div>
            <div className="conversation-list">
                {safeMessages.length === 0 ? (
                    <div className="empty-state">
                        Conversation will appear here.
                    </div>
                ) : (
                    safeMessages.map(
                        message => {
                            const isCustomer =
                                message.sender ===
                                "customer";
                            return (
                                <div
                                    className={
                                        isCustomer
                                            ? "conversation-message customer"
                                            : "conversation-message agent"
                                    }
                                    key={message.id}
                                >
                                    <div className="message-icon">
                                        {isCustomer
                                            ? <UserRound size={14} />
                                            : <Bot size={14} />
                                        }
                                    </div>
                                    <div className="message-content">
                                        <div className="message-header">
                                            <strong>
                                                {message.name}
                                            </strong>
                                            <span>
                                                {message.time}
                                            </span>
                                        </div>
                                        <p>
                                            {message.text}
                                        </p>
                                    </div>
                                </div>
                            );
                        }
                    )
                )}
            </div>
        </section>
    );
}
export default Conversation;