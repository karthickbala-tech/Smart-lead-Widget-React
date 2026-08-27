import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Pause,
    UserPlus
} from "lucide-react";
function CallControls({
    status,
    muted,
    setMuted,
    onAccept,
    onEnd
}) {
    if (status === "ringing") {
        return (
            <div className="call-controls">
                <button
                    className="call-button decline"
                    onClick={onEnd}
                >
                    <PhoneOff size={19} />
                    Decline
                </button>
                <button
                    className="call-button accept"
                    onClick={onAccept}
                >
                    <Phone size={19} />
                    Accept
                </button>
            </div>
        );
    }
    if (status !== "active") {
        return null;
    }
    return (
        <div className="call-controls active-controls">
            <button
                className="control-button"
                onClick={() =>
                    setMuted(
                        !muted
                    )
                }
            >
                {muted
                    ? <MicOff size={18} />
                    : <Mic size={18} />
                }
                <span>
                    {muted
                        ? "Unmute"
                        : "Mute"
                    }
                </span>
            </button>
            <button className="control-button">
                <Pause size={18} />
                <span>
                    Hold
                </span>
            </button>
            <button className="control-button">
                <UserPlus size={18} />
                <span>
                    Transfer
                </span>
            </button>
            <button
                className="control-button end"
                onClick={onEnd}
            >
                <PhoneOff size={18} />
                <span>
                    End
                </span>
            </button>
        </div>
    );
}
export default CallControls;