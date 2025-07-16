import {RefObject} from "react";

export const useDropdownPosition = (
    ref: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>,
) => {
    const getDropdownPosition = () => {
        if (!ref.current) {
            return {top: 0, left: 0};
        }

        const rect = ref.current.getBoundingClientRect();
        const dropDownWidth = 240; // width of dropdown (w-60 = 15rem = 240px)

        //calculate initial position
        let left = rect.left + window.scrollX;
        const top = rect.top + window.scrollY;

        //Check if dropdown would go off the right edge of the viewport
        if (left + dropDownWidth > window.innerWidth) {
            left = rect.right + window.scrollX - dropDownWidth;
            //if still off-screen, align to the right edge of the viewport with some padding
            if (left < 0) {
                left = window.innerWidth - dropDownWidth - 16;
            }
        }

        // ensure dropdown doesn't go off left edge
        if (left < 0) {
            left = 16;
        }

        return {top, left};
    };

    return {getDropdownPosition};
};
