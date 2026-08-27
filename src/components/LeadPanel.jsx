import {
    UserRound,
    Building2,
    Phone,
    Mail,
    Package,
    Save,
    CheckCircle
} from "lucide-react";
function LeadPanel({
    lead,
    errors,
    updateLead,
    createLead,
    created
}) {
    const fields = [
        {
            field: "Last_Name",
            label: "Customer Name",
            placeholder: "Enter customer name",
            icon: UserRound
        },
        {
            field: "Company",
            label: "Company",
            placeholder: "Enter company name",
            icon: Building2
        },
        {
            field: "Phone",
            label: "Phone",
            placeholder: "Enter phone number",
            icon: Phone
        },
        {
            field: "Email",
            label: "Email",
            placeholder: "Enter email address",
            icon: Mail
        },
        {
            field: "Product",
            label: "Product Interest",
            placeholder: "Product or service",
            icon: Package
        }
    ];
    return (
        <section className="lead-panel">
            <div className="panel-title">
                <div>
                    <span>
                        CRM
                    </span>
                    <h2>
                        Lead Details
                    </h2>
                </div>
                {created && (
                    <CheckCircle
                        size={18}
                        className="success-icon"
                    />
                )}
            </div>
            <div className="lead-form">
                {fields.map(
                    field => {
                        const Icon =
                            field.icon;
                        return (
                            <div
                                className="lead-field"
                                key={field.field}
                            >
                                <label>
                                    <Icon
                                        size={14}
                                    />
                                    {field.label}
                                </label>
                                <input
                                    value={
                                        lead[
                                            field.field
                                        ] || ""
                                    }
                                    onChange={
                                        event =>
                                            updateLead(
                                                field.field,
                                                event.target.value
                                            )
                                    }
                                    placeholder={
                                        field.placeholder
                                    }
                                />
                                {errors[
                                    field.field
                                ] && (
                                    <small className="field-error">
                                        {
                                            errors[
                                                field.field
                                            ]
                                        }
                                    </small>
                                )}
                            </div>
                        );
                    }
                )}
            </div>
            <div className="lead-description">
                <label>
                    Description
                </label>
                <textarea
                    value={
                        lead.Description
                    }
                    onChange={
                        event =>
                            updateLead(
                                "Description",
                                event.target.value
                            )
                    }
                    placeholder="Conversation summary..."
                    rows="4"
                />
            </div>
            <button
                className="create-lead-button"
                onClick={createLead}
                disabled={created}
            >
                {created
                    ? <CheckCircle size={17} />
                    : <Save size={17} />
                }
                {created
                    ? "Lead already saved to Zoho CRM"
                    : "Create Lead"
                }
            </button>
        </section>
    );
}
export default LeadPanel;