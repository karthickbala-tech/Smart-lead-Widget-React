const conversationService = {
    async extractLead(conversation) {
        try {
            const response = await fetch(
                "/api/conversation/extract",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        conversation
                    })
                }
            );
            if (!response.ok) {
                throw new Error(
                    "AI extraction failed"
                );
            }
            return await response.json();
        } catch (error) {
            console.error(
                "Conversation extraction error:",
                error
            );
            throw error;
        }
    }
};
export default conversationService;