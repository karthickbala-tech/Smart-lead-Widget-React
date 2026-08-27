export function formatDuration(seconds = 0) {
    const safeSecs = typeof seconds === "number" && !isNaN(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const mins = Math.floor(safeSecs / 60);
    const secs = safeSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function getInitials(name = "Customer") {
    if (!name || typeof name !== "string") return "C";
    const clean = name.trim();
    if (!clean) return "C";
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "C";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase() || "C";
    return ((parts[0].charAt(0) || "") + (parts[parts.length - 1].charAt(0) || "")).toUpperCase() || "C";
}

export function isValidEmail(email) {
    if (!email || typeof email !== "string") return false;
    const clean = email.trim();
    if (!clean) return false;
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(clean);
}

export function isValidPhone(phone) {
    if (!phone) return false;
    const clean = String(phone).replace(/[^0-9]/g, "");
    return clean.length >= 7 && clean.length <= 15;
}

export function getLeadValidationErrors(lead = {}) {
    const errors = {};
    if (!lead || typeof lead !== "object") return errors;

    const email = lead.Email || lead.email;
    if (email !== undefined && email !== null && String(email).trim() !== "") {
        if (!isValidEmail(email)) {
            errors.Email = "Invalid email format (e.g. name@example.com)";
        }
    }

    const phone = lead.Phone || lead.phone || lead.contact_number;
    if (phone !== undefined && phone !== null && String(phone).trim() !== "") {
        const digits = String(phone).replace(/[^0-9]/g, "");
        if (digits.length < 7) {
            errors.Phone = "Phone number is too short (min 7 digits)";
        } else if (digits.length > 15) {
            errors.Phone = "Phone number is too long (max 15 digits)";
        }
    }

    return errors;
}

export function cleanLeadData(lead = {}) {
    return {
        Last_Name: lead.Last_Name ? String(lead.Last_Name).trim() : (lead.Full_Name ? String(lead.Full_Name).trim() : ""),
        Company: lead.Company ? String(lead.Company).trim() : "",
        Phone: lead.Phone ? String(lead.Phone).trim() : "",
        Email: lead.Email ? String(lead.Email).trim() : "",
        Description: lead.Description ? String(lead.Description).trim() : "",
        Product: lead.Product ? String(lead.Product).trim() : ""
    };
}

export function hasValidLeadData(lead) {
    if (!lead || typeof lead !== "object") return false;
    const meaningfulFields = [
        lead.Full_Name,
        lead.full_name,
        lead.First_Name,
        lead.first_name,
        lead.Last_Name,
        lead.last_name,
        lead.name,
        lead.Company,
        lead.company_name,
        lead.company,
        lead.organization,
        lead.Organization,
        lead.Phone,
        lead.phone,
        lead.contact_number,
        lead.Email,
        lead.email,
        lead.Product,
        lead.product,
        lead.product_service_interest,
        lead.Product_Interest,
        lead.Industry,
        lead.industry,
        lead.City,
        lead.city,
        lead.location_city,
        lead.location,
        lead.Description,
        lead.description,
        lead.Customer_Requirement,
        lead.customer_requirement_scope
    ];
    return meaningfulFields.some(val => {
        if (val === undefined || val === null) return false;
        const str = String(val).trim();
        return str !== "" && str.toLowerCase() !== "null" && str.toLowerCase() !== "undefined";
    });
}

export function validateLead(lead = {}) {
    const errors = {};
    if (!lead.Last_Name && !lead.Full_Name) {
        errors.Last_Name = "Customer Name / Last Name is required";
    }
    if (!lead.Company) {
        errors.Company = "Company name is required";
    }
    if (lead.Email && !isValidEmail(lead.Email)) {
        errors.Email = "Enter a valid email address";
    }
    if (lead.Phone && !isValidPhone(lead.Phone)) {
        errors.Phone = "Enter a valid phone number (at least 7 digits)";
    }
    return errors;
}
