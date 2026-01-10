import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { refreshSession } from '../../../../_utilities/network/Authorization/sessions/session';
import { storeUser, removeUser } from '@/_store/reducers/userReducer/userSlice';

export default function SessionProviders({children}: { children: React.ReactNode}) {
    const dispatch = useDispatch();

    useEffect(()=>{
        async function handleTokenRefresh(){
            const data = await refreshSession();

            if (data){
                dispatch(storeUser(data));
            }
            else {
                dispatch(removeUser())
            }
        }
        handleTokenRefresh()
    })

    return <>
        {children}
    </>
}