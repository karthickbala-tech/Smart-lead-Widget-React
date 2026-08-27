import {
    useCallback,
    useState
} from "react";
import {
    initialLead
} from "../data/mockLead";
import {
    validateLead
} from "../utils/helpers";
export function useLead() {
    const [
        lead,
        setLead
    ] = useState(initialLead);
    const [
        errors,
        setErrors
    ] = useState({});
    const [
        created,
        setCreated
    ] = useState(false);
    const updateLead = useCallback((
        field,
        value
    ) => {
        setLead(
            previous => ({
                ...previous,
                [field]: value
            })
        );
        setCreated(false);
    }, []);
    const updateMultiple = useCallback((
        values
    ) => {
        setLead(
            previous => ({
                ...previous,
                ...values
            })
        );
    }, []);
    const validate = useCallback(() => {
        const validationErrors =
            validateLead(lead);
        setErrors(
            validationErrors
        );
        return Object.keys(
            validationErrors
        ).length === 0;
    }, [lead]);
    const createLead = useCallback(() => {
        const validationErrors =
            validateLead(lead);
        setErrors(
            validationErrors
        );
        if (Object.keys(validationErrors).length > 0) {
            return false;
        }
        setCreated(true);
        return true;
    }, [lead]);
    const resetLead = useCallback(() => {
        setLead(initialLead);
        setErrors({});
        setCreated(false);
    }, []);
    return {
        lead,
        errors,
        created,
        updateLead,
        updateMultiple,
        validate,
        createLead,
        resetLead
    };
}