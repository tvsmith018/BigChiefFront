"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";

const CURRENTDATE = new Date();
const CURRENTYEAR = CURRENTDATE.getFullYear();
const ITEM_HEIGHT = 25;
const ROWS = 5;
const defaultDateTimeFormatOptions = {
    month: "long",
};
/**
 * A scroll-based date picker with 3D scroll effects like iOS wheels.
 */
const DateScrollPicker = ({ itemHeight = ITEM_HEIGHT, visibleRows = ROWS, startYear = 1900, dateTimeFormatOptions = defaultDateTimeFormatOptions, defaultYear = new Date().getFullYear(), defaultDay = new Date().getDate(), defaultMonth = new Date().getMonth(), highlightOverlayStyle, onDateChange, onChange}) => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", dateTimeFormatOptions));
    const years = Array.from({ length: CURRENTYEAR - startYear + 1 }, (_, i) => startYear + i);
    const [selectedDay, setSelectedDay] = useState(defaultDay);
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
    const [selectedYear, setSelectedYear] = useState(defaultYear);
    const [daysInMonth, setDaysInMonth] = useState(31);
    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const rawRows = visibleRows ?? 5;
    const rows = rawRows % 2 === 0 ? rawRows + 1 : rawRows;
    const scrollToIndex = (ref, index) => {
        if (ref.current) {
            ref.current.scrollTo({
                top: index * itemHeight,
                behavior: "smooth",
            });
        }
    };
    useEffect(() => {
        if (onDateChange) {
            const date = new Date(selectedYear, selectedMonth, selectedDay);
            onDateChange(date); // Or use .toLocaleDateString() if needed
        }

        if (onChange) {
            onChange()
        }
    }, [selectedDay, selectedMonth, selectedYear]);
    const update3DEffect = (ref) => {
        if (!ref.current)
            return;
        const items = Array.from(ref.current.children);
        const center = ref.current.scrollTop +
            itemHeight * Math.floor(rows / 2) +
            itemHeight / 2;
        const maxAngle = 360;
        items.forEach((item) => {
            const itemCenter = item.offsetTop + itemHeight / 2;
            const distance = itemCenter - center;
            const indexOffset = distance / itemHeight;
            // Only apply negative margins for items 2+ rows away from center
            const shouldOffset = Math.abs(indexOffset) >= 0.5;
            // Signed rotation angle
            const angle = indexOffset * 20;
            const rotateX = Math.max(-maxAngle, Math.min(maxAngle, angle));
            // Smooth fade + scale
            const scale = Math.max(0.96, 1 - Math.abs(distance) / 1000);
            const opacity = Math.max(0.3, 1 - Math.abs(distance) / 75);
            // Apply transform
            item.style.transform = `rotateX(${rotateX}deg) scale(${scale})`;
            item.style.opacity = `${opacity}`;
            item.style.transformOrigin = "left center";
            item.style.backfaceVisibility = "hidden";
            item.style.willChange = "transform, opacity";
            // Margin adjustments to fill visible gap without breaking spacing
            // Apply dynamic negative margin based on rotation only (not for flat center)
            if (!shouldOffset) {
                const marginAdjustment = -Math.abs(rotateX) * 0.12; // tweak factor
                if (indexOffset > 5) {
                    item.style.marginTop = `${marginAdjustment}px`;
                }
                else {
                    item.style.marginBottom = `${marginAdjustment}px`;
                }
            }
        });
    };
    const handleScroll = (ref, values, setter) => {
        if (!ref.current)
            return;
        const scrollTop = ref.current.scrollTop;
        const visibleCenter = scrollTop + itemHeight * Math.floor(rows / 2) + itemHeight / 2;
        // Get closest matching child to visual center
        const items = Array.from(ref.current.children);
        let closestIndex = 0;
        let minDistance = Infinity;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemCenter = item.offsetTop + itemHeight / 2;
            const distance = Math.abs(itemCenter - visibleCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }
        // Ignore padding items (top/bottom placeholders)
        const paddingCount = Math.floor(rows / 2);
        const valueIndex = closestIndex - paddingCount;
        if (values[valueIndex] !== undefined) {
            setter(values[valueIndex]);
        }
        update3DEffect(ref);
    };
    useEffect(() => {
        const dim = getDaysInMonth(selectedMonth, selectedYear);
        setDaysInMonth(dim);
        if (selectedDay > dim) {
            setSelectedDay(dim);
            scrollToIndex(dayRef, dim - 1);
        }
    }, [selectedMonth, selectedYear]);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingCount = Math.floor(rows / 2);
    useEffect(() => {
        scrollToIndex(dayRef, selectedDay - 1);
        scrollToIndex(monthRef, selectedMonth);
        scrollToIndex(yearRef, years.indexOf(selectedYear));
        update3DEffect(dayRef);
        update3DEffect(monthRef);
        update3DEffect(yearRef);
    }, []);
    const styles = {
        container: {
            fontFamily: "inherit",
            margin: "16px auto",
            textAlign: "center",
            position: "relative",
            zIndex: "1",
        },
        pickerWrapper: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: itemHeight * rows,
            position: "relative",
        },
        pickerColumn: {
            width: "33%",
            height: itemHeight * rows,
            overflowY: "scroll",
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
            borderRadius: 8,
            perspective: 1000,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            transformStyle: "preserve-3d", // critical
        },
        pickerItem: {
            height: itemHeight,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            scrollSnapAlign: "center",
            fontSize: 16,
            fontWeight: 500,
            color: "#333",
            transition: "transform 0.2s ease, opacity 0.2s ease",
        },
        highlightOverlay: {
            position: "absolute",
            top: itemHeight * Math.floor(rows / 2),
            height: itemHeight,
            left: 0,
            right: 0,
            border: "1px solid #eee",
            background: "#eee",
            borderRadius: 4,
            pointerEvents: "none",
            zIndex: -1,
        },
        output: {
            marginTop: 20,
            fontSize: 18,
            fontWeight: 600,
        },
    };
    return (_jsx("div", { id: "container", style: styles.container, children: _jsxs("div", { id: "pickerWrapper", style: styles.pickerWrapper, children: [_jsxs("div", { style: styles.pickerColumn, ref: dayRef, onScroll: () => handleScroll(dayRef, days, setSelectedDay), children: [Array.from({ length: paddingCount }).map((_, i) => (_jsx("div", { style: styles.pickerItem }, `pad-day-top-${i}`))), days.map((d) => (_jsx("div", { style: { ...styles.pickerItem, justifyContent: "flex-start", paddingLeft: "45px" }, children: d }, d))), Array.from({ length: paddingCount }).map((_, i) => (_jsx("div", { style: styles.pickerItem }, `pad-day-bottom-${i}`)))] }), _jsxs("div", { style: styles.pickerColumn, ref: monthRef, onScroll: () => handleScroll(monthRef, months.map((_, i) => i), setSelectedMonth), children: [Array.from({ length: paddingCount }).map((_, i) => (_jsx("div", { style: styles.pickerItem }, `pad-month-top-${i}`))), months.map((m, i) => (_jsx("div", { style: { ...styles.pickerItem, justifyContent: "flex-start" }, children: m }, i))), Array.from({ length: paddingCount }).map((_, i) => (_jsx("div", { style: styles.pickerItem }, `pad-month-bottom-${i}`)))] }), _jsxs("div", { style: styles.pickerColumn, ref: yearRef, onScroll: () => handleScroll(yearRef, years, setSelectedYear), children: [Array.from({ length: paddingCount }).map((_, i) => (_jsx("div", { style: styles.pickerItem }, `pad-year-top-${i}`))), years.map((y) => (_jsx("div", { style: styles.pickerItem, children: y }, y))), Array.from({ length: paddingCount }).map((_, i) => (_jsx("div", { style: styles.pickerItem }, `pad-year-bottom-${i}`)))] }), _jsx("div", { id: "highlightOverlay", style: { ...styles.highlightOverlay, ...highlightOverlayStyle } })] }) }));
};
export default DateScrollPicker;