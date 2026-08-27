import {
    Sparkles,
    UserRound,
    Building2,
    Phone,
    Mail
} from "lucide-react";
function Spotlight({
    lead
}) {
    const fields = [
        {
            label: "Name",
            value: lead.Last_Name,
            icon: UserRound
        },
        {
            label: "Company",
            value: lead.Company,
            icon: Building2
        },
        {
            label: "Phone",
            value: lead.Phone,
            icon: Phone
        },
        {
            label: "Email",
            value: lead.Email,
            icon: Mail
        }
    ];
    return (
        <section className="spotlight-panel">
            <div className="panel-title">
                <div className="spotlight-heading">
                    <Sparkles
                        size={17}
                    />
                    <div>
                        <span>
                            AI INSIGHTS
                        </span>
                        <h2>
                            Lead Spotlight
                        </h2>
                    </div>
                </div>
            </div>
            <div className="spotlight-grid">
                {fields.map(
                    field => {
                        const Icon =
                            field.icon;
                        return (
                            <div
                                className="spotlight-item"
                                key={field.label}
                            >
                                <Icon size={15} />
                                <div>
                                    <span>
                                        {field.label}
                                    </span>
                                    <strong>
                                        {field.value ||
                                            "Not detected"}
                                    </strong>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </section>
    );
}
export default Spotlight;