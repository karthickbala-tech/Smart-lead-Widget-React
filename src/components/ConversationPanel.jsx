import { MessageSquare } from "lucide-react";
function ConversationPanel({
    messages = []
}) {
    return (
        <section className="conversation-section">
            <div className="section-header">
                <div>
                    <span className="section-label">
                        AI
                    </span>
                    <h2>
                        Live Conversation
                    </h2>
                </div>
                <MessageSquare size={18} />
            </div>
            <div className="conversation-box">
                {messages.length === 0 ? (
                    <div className="empty-conversation">
                        Conversation will appear here.
                    </div>
                ) : (
                    messages.map(
                        (message, index) => (
                            <div
                                key={index}
                                className={`message ${
                                    message.sender === "customer"
                                        ? "customer"
                                        : "agent"
                                }`}
                            >
                                <span>
                                    {message.sender ===
                                    "customer"
                                        ? "Customer"
                                        : "AI"}
                                </span>
                                <p>
                                    {message.text}
                                </p>
                            </div>
                        )
                    )
                )}
            </div>
        </section>
    );
}
export default ConversationPanel;