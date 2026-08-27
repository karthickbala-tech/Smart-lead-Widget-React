import {
    PhoneIncoming,
    PhoneOutgoing,
    PhoneMissed
} from "lucide-react";
import {
    mockCalls
} from "../data/mockCalls";
import {
    formatDuration,
    getInitials
} from "../utils/helpers";
function CallHistory() {
    return (
        <div className="history-panel">
            <div className="panel-title">
                <div>
                    <span>
                        RECENT
                    </span>
                    <h2>
                        Call History
                    </h2>
                </div>
            </div>
            <div className="history-list">
                {mockCalls.map(
                    call => {
                        const Icon =
                            call.type === "incoming"
                                ? PhoneIncoming
                                : call.type === "outgoing"
                                    ? PhoneOutgoing
                                    : PhoneMissed;
                        return (
                            <div
                                className="history-item"
                                key={call.id}
                            >
                                <div className="history-avatar">
                                    {getInitials(
                                        call.name
                                    )}
                                </div>
                                <div className="history-info">
                                    <h3>
                                        {call.name}
                                    </h3>
                                    <p>
                                        {call.phone}
                                    </p>
                                    {call.company && (
                                        <span>
                                            {call.company}
                                        </span>
                                    )}
                                </div>
                                <div className="history-meta">
                                    <Icon
                                        size={14}
                                    />
                                    <span>
                                        {call.time}
                                    </span>
                                    {call.duration > 0 && (
                                        <small>
                                            {formatDuration(
                                                call.duration
                                            )}
                                        </small>
                                    )}
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}
export default CallHistory;