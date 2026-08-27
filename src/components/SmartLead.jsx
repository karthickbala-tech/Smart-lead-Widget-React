import {
    useState
} from "react";
import {
    Phone,
    Sparkles,
    UserRound
} from "lucide-react";
import LeadForm from "./LeadForm";
import ConversationPanel
    from "./ConversationPanel";
import CallPopup
    from "./CallPopup";
import { useZohoCRM }
    from "../hooks/useZohoCRM";
import { useRingCentral }
    from "../hooks/useRingCentral";
function SmartLead() {
    const {
        user
    } = useZohoCRM();
    const {
        connected:
            ringCentralConnected
    } = useRingCentral();
    const [
        callActive,
        setCallActive
    ] = useState(false);
    const [
        caller,
        setCaller
    ] = useState({
        name: "Subham",
        phone: "9876543210",
        company: "ABC Private Ltd"
    });
    const [
        messages,
        setMessages
    ] = useState([]);
    const [
        lead,
        setLead
    ] = useState({
        Last_Name: "Subham",
        Company: "ABC Private Ltd",
        Phone: "9876543210",
        Email: "",
        Description: ""
    });
    const acceptCall = () => {
        setCallActive(true);
        setMessages([
            {
                sender: "customer",
                text:
                    "Hello, I'm interested in your product."
            },
            {
                sender: "agent",
                text:
                    "Sure. May I know your name and company?"
            }
        ]);
    };
    const declineCall = () => {
        setCaller(null);
        setCallActive(false);
    };
    return (
        <div className="smart-lead">
            {/* Header */}
            <header className="smart-lead-header">
                <div className="header-title">
                    <div className="header-icon">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h1>
                            Smart Lead
                        </h1>
                        <span>
                            AI-powered lead creation
                        </span>
                    </div>
                </div>
                <div className="status">
                    <span
                        className={`status-dot ${
                            ringCentralConnected
                                ? "connected"
                                : "disconnected"
                        }`}
                    />
                    {ringCentralConnected
                        ? "RingCentral Ready"
                        : "CRM Ready"
                    }
                </div>
            </header>
            {/* User information */}
            {user && (
                <div className="user-bar">
                    <UserRound size={14} />
                    <span>
                        {user?.users?.[0]?.full_name ||
                            "Zoho CRM User"}
                    </span>
                </div>
            )}
            {/* Incoming Call */}
            {caller && !callActive && (
                <CallPopup
                    caller={caller}
                    onAccept={
                        acceptCall
                    }
                    onDecline={
                        declineCall
                    }
                />
            )}
            {/* Active Call */}
            <section className="call-section">
                <div className="section-header">
                    <div>
                        <span className="section-label">
                            CALL
                        </span>
                        <h2>
                            {callActive
                                ? "Active Call"
                                : "Incoming Call"
                            }
                        </h2>
                    </div>
                    <Phone size={18} />
                </div>
                <div className="caller-card">
                    <div className="caller-avatar">
                        <UserRound size={26} />
                    </div>
                    <div className="caller-info">
                        <h3>
                            {lead.Last_Name ||
                                "Unknown Caller"}
                        </h3>
                        <p>
                            {lead.Phone ||
                                "No phone number"}
                        </p>
                        <span>
                            {lead.Company ||
                                "Unknown company"}
                        </span>
                    </div>
                </div>
                {callActive && (
                    <button
                        className="end-btn"
                        onClick={() =>
                            setCallActive(false)
                        }
                    >
                        End Call
                    </button>
                )}
            </section>
            {/* Conversation */}
            <ConversationPanel
                messages={messages}
            />
            {/* Lead */}
            <LeadForm
                lead={lead}
                setLead={setLead}
            />
        </div>
    );
}
export default SmartLead;