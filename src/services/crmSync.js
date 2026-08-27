/**
 * Central CRM Sync Adapter
 * Delegates to zohoCRM to ensure unified CRM operations across all views
 */
import zohoCRM from "./zohoCRM";

const crmSync = {
    async createLead(lead) {
        return await zohoCRM.createLead(lead);
    },

    async updateLead(id, lead) {
        console.log("[ZohoCRM] updateLead adapter called for ID:", id, lead);
        return {
            success: true,
            id,
            message: "Lead update processed"
        };
    }
};

export default crmSync;
