"use client"
import { useState, useEffect } from "react";
import FormLabel from "react-bootstrap/FormLabel";
import FormCheck from "react-bootstrap/FormCheck";
import { useSelector } from 'react-redux';
import { getSession } from "../../../../_utilities/network/Authorization/sessions/session";

const StarsView = ({article_id}:{article_id:string}) => {
    const [rating, setRating] = useState(0);
    const [userHasVote, setUserHasVote] = useState<boolean|undefined>(undefined)
    const isAuthenticated = useSelector((state:{userReducer:{isAuthenticated:boolean}}) => state['userReducer']['isAuthenticated']);
    const [userToken, setUserToken] = useState<{access:string|undefined, session:string|undefined}>({access:undefined, session:undefined})

    const handle_click =async (rate:number) => {
        setRating(rate);
        const requestOptions: RequestInit = {
            method: "Post",
            headers: {
                "Content-Type": "application/json",
                "Authorization":`Bearer ${userToken.access}`,
            },
            body: JSON.stringify({
                rate:rate
            })
        }

        const responseUser = await fetch(`https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/articles/ratearticle/${article_id}/`, requestOptions);
        const raw = await responseUser.json();
        const message = raw.message;

        if (message == "The rating saved"){
            setUserHasVote(false)
        }
    }

    useEffect(()=>{
        if (isAuthenticated) {
            getSession().then(async (token)=>{
                setUserToken(token)
                const requestOptions: RequestInit = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization":`Bearer ${token.access}`,
                    },
                }

                const responseUser = await fetch(`https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/articles/userrate/${article_id}/`, requestOptions);
                const raw = await responseUser.json();
                const message = raw.message;

                if (message == "User have not rated this article"){
                    setUserHasVote(true)
                }
                else(
                    setUserHasVote(false)
                )
            })
        }
    },[article_id])
    
    return <>
        {isAuthenticated && userHasVote && [...Array(5)].map((star:undefined, index:number) => {
            const currentRate = index + 1
            return (     
                <FormLabel key={index}>
                    <FormCheck 
                        type="radio"
                        name="rate"
                        value = {currentRate}
                    />
                    <i className="bi bi-star-fill pe-2" style={{fontSize:20, color: currentRate <= rating ? "rgba(255, 193, 7, 0.7)":"grey"}} onClick={async ()=> await handle_click(currentRate)}></i>
                </FormLabel> 
            )
        })}
        {
            isAuthenticated && userHasVote == false && <div>Rate Submitted</div>
        }
        {
            !isAuthenticated && <div>Login to Rate</div>
        }
    </>
}

export default StarsView