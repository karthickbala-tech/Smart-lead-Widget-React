import {
    useState
} from "react";
export function useDialpad() {
    const [
        number,
        setNumber
    ] = useState("");
    const addDigit = (digit) => {
        setNumber(
            previous =>
                previous + digit
        );
    };
    const removeDigit = () => {
        setNumber(
            previous =>
                previous.slice(0, -1)
        );
    };
    const clearNumber = () => {
        setNumber("");
    };
    return {
        number,
        addDigit,
        removeDigit,
        clearNumber
    };
}