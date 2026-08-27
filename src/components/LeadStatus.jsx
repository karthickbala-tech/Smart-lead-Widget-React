import {
    CheckCircle,
    AlertCircle,
    LoaderCircle
} from "lucide-react";
function LeadStatus({
    status,
    message
}) {
    if (!status) {
        return null;
    }
    let icon = null;
    if (status === "success") {
        icon = <CheckCircle size={16} />;
    } else if (status === "error") {
        icon = <AlertCircle size={16} />;
    } else if (status === "loading") {
        icon = (
            <LoaderCircle
                size={16}
                className="spin"
            />
        );
    }
    return (
        <div
            className={`lead-status ${status}`}
        >
            {icon}
            <span>
                {message}
            </span>
        </div>
    );
}
export default LeadStatus;