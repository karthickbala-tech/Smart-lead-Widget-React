const ringcentralEvents = {
    simulateIncomingCall(
        callback
    ) {
        const caller = {
            name: "Subham",
            phone: "9876543210",
            company:
                "ABC Private Ltd"
        };
        console.log(
            "Mock RingCentral Event:",
            caller
        );
        if (callback) {
            callback(caller);
        }
    },
    simulateCallEnded(
        callback
    ) {
        console.log(
            "Mock call ended"
        );
        if (callback) {
            callback();
        }
    }
};
export default ringcentralEvents;