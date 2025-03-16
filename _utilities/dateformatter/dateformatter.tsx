import { useState, useEffect, useRef } from 'react';

type TimeInterval = {
    seconds: number,
    minutes: number, 
    hours: number, 
    days: number, 
    weeks: number,
    months: number, 
    years:number
}
function calculateIntervals(now:Date, date:Date): TimeInterval {
    const milliDiff = now.getTime() - date.getTime();
    const totalSeconds = Math.floor(milliDiff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = Math.floor(totalWeeks / 4);
    const totalYears = Math.floor(totalMonths / 12);

    const remSecs = totalSeconds % 60;
    const remMins = totalMinutes % 60
    const remHrs = totalHours % 24
    const remDays = totalDays % 7
    const remWeeks = totalWeeks % 4
    const remMonths = totalMonths % 12
    
    return {
        seconds: remSecs,
        minutes: remMins,
        hours: remHrs,
        days: remDays,
        weeks: remWeeks,
        months: remMonths,
        years: totalYears
    }
}

function dateMessage(intervals: TimeInterval):string {
    if (intervals.years > 0){
        if (intervals.years == 1)  return "1 year ago";
        
        return `${intervals.years} years ago`

    }

    if (intervals.months > 0){
        if (intervals.months == 1) return "1 month ago"

        return `${intervals.months} months ago`
    }

    if (intervals.weeks > 0){
        if (intervals.weeks == 1) return "1 week ago"

        return `${intervals.weeks} weeks ago`
    }

    if (intervals.days > 0){
        if (intervals.days == 1) return "1 day ago"

        return `${intervals.days} days ago`
    }

    if (intervals.hours > 0){
        if (intervals.hours == 1) return "1 hour ago"

        return `${intervals.hours} hours ago`
    }

    if (intervals.minutes >= 5){

        return `${intervals.minutes} minutes ago`
    }

    return "NEW!!!"
}

export const DateFormatter = ({created}:{created: string}) => {
    const [message, setMessage] = useState<string>("mounting...")
    const hasMounted = useRef(false)

    useEffect(()=>{
        if (hasMounted.current) {
            const date = new Date(created);
            const now = new Date();
            const interval = calculateIntervals(now, date);
            setMessage(dateMessage(interval));
        }
        else{
            hasMounted.current = true;
        }
    },[message]);
    
    return <span>{message}</span>
}