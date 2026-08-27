import { useState } from "react";
import {
    UserRound,
    Building2,
    Phone,
    Mail,
    Plus
} from "lucide-react";
import zohoCRM from "../services/zohoCRM";
import {
    cleanLeadData,
    isValidEmail,
    isValidPhone
} from "../utils/helpers";
import LeadStatus from "./LeadStatus";

function LeadForm({
    lead,
    setLead
}) {
    const [
        status,
        setStatus
    ] = useState(null);
    const [
        message,
        setMessage
    ] = useState("");
    const [
        saving,
        setSaving
    ] = useState(false);

    const updateField = (field, value) => {
        setLead(previous => ({
            ...previous,
            [field]: value
        }));
    };

    const createLead = async () => {
        if (saving) return;
        if (status === "success") {
            setMessage("This lead has already been saved to Zoho CRM.");
            return;
        }
        const cleanData = cleanLeadData(lead);
        if (!cleanData.Last_Name) {
            setStatus("error");
            setMessage("Lead name is required.");
            return;
        }
        if (!cleanData.Company) {
            setStatus("error");
            setMessage("Company name is required.");
            return;
        }
        if (cleanData.Phone && !isValidPhone(cleanData.Phone)) {
            setStatus("error");
            setMessage("Enter a valid phone number (at least 7 digits).");
            return;
        }
        if (cleanData.Email && !isValidEmail(cleanData.Email)) {
            setStatus("error");
            setMessage("Enter a valid email address.");
            return;
        }

        try {
            setSaving(true);
            setStatus("loading");
            setMessage("Saving...");

            const response = await zohoCRM.createLead(cleanData);
            console.log("[ZohoCRM] Lead created response:", response);

            setStatus("success");
            setMessage(
                response.isMock
                    ? "Lead already saved to Zoho CRM (Mock Mode)."
                    : `Lead already saved to Zoho CRM (ID: ${response.id}).`
            );
        } catch (error) {
            console.error("[ZohoCRM] Lead creation failed:", error);
            setStatus("error");
            setMessage(error.message || "Failed to create lead in Zoho CRM.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="lead-section">
            <div className="section-header">
                <div>
                    <span className="section-label">
                        CRM
                    </span>
                    <h2>
                        Lead Preview
                    </h2>
                </div>
            </div>
            <div className="form-grid">
                <div className="form-field">
                    <label>
                        <UserRound size={14} />
                        Name
                    </label>
                    <input
                        type="text"
                        value={lead.Last_Name || ""}
                        onChange={event => updateField("Last_Name", event.target.value)}
                        placeholder="Customer name"
                    />
                </div>
                <div className="form-field">
                    <label>
                        <Building2 size={14} />
                        Company
                    </label>
                    <input
                        type="text"
                        value={lead.Company || ""}
                        onChange={event => updateField("Company", event.target.value)}
                        placeholder="Company name"
                    />
                </div>
                <div className="form-field">
                    <label>
                        <Phone size={14} />
                        Phone
                    </label>
                    <input
                        type="tel"
                        value={lead.Phone || ""}
                        onChange={event => updateField("Phone", event.target.value)}
                        placeholder="Phone number"
                    />
                </div>
                <div className="form-field">
                    <label>
                        <Mail size={14} />
                        Email
                    </label>
                    <input
                        type="email"
                        value={lead.Email || ""}
                        onChange={event => updateField("Email", event.target.value)}
                        placeholder="Email address"
                    />
                </div>
            </div>
            <button
                className="create-lead-btn"
                onClick={createLead}
                disabled={saving || status === "success"}
            >
                <Plus size={16} />
                {saving ? "Saving..." : status === "success" ? "Lead already saved to Zoho CRM" : "Create Lead"}
            </button>
            <LeadStatus
                status={status}
                message={message}
            />
        </section>
    );
}

export default LeadForm;
