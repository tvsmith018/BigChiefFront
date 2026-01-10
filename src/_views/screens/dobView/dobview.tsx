import { Dispatch } from 'react'
import { SetStateAction } from 'react'
import DateScrollPicker from '../../../../_utilities/datatype/datePicker/DateScrollPicker'

export default function DOBInputView({prompt, setDate, removeError}:{prompt:string, setDate:Dispatch<SetStateAction<Date | undefined>>, removeError:(event: React.ChangeEvent<HTMLInputElement>) => void}){
    return<>
        <p>{prompt}</p>
        <div style={{width:"300px", margin:"0 auto"}}>
            <DateScrollPicker startYear={1900}  endYear={2025}  onDateChange={setDate} onChange={removeError}/>
        </div>
    </>
}