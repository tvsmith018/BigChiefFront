export type DateScrollPickerProps = {
    /**
     * Height (in px) of each scroll item
     * @default 25
     */
    itemHeight?: number;
    /**
      * Number of visible rows (should be an odd number for center alignment)
      * Will auto-adjust to the nearest odd number if even.
      * @default 5
      */
    visibleRows?: number;
    /**
     * Starting year for year picker
     * @default 2000
     */
    startYear?: number;
    /**
     * Ending year for year picker
     * @default startYear + 99
     */
    endYear?: number;
    /**
     * Intl formatting options for displaying months
     * @default { month: 'long' }
     */
    dateTimeFormatOptions?: Intl.DateTimeFormatOptions;
    /**
     * Default selected year
     * @default current year
     */
    defaultYear?: number;
    /**
     * Default selected month (0-indexed)
     * @default current month
     */
    defaultMonth?: number;
    /**
     * Default selected day
     * @default current day
     */
    defaultDay?: number;
    /**
   * Custom styles for the highlight overlay indicator (center selector box)
   */
    highlightOverlayStyle?: React.CSSProperties;
    /**
     * Callback when selected date changes
     */
    onDateChange?: (date: Date) => void;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
//# sourceMappingURL=type.d.ts.map