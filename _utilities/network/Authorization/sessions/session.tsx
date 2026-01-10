"use server"
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose';
import { revalidatePath } from 'next/cache';

const refreshExpiresAt = 60*60*24*14;
const accessExpiresAt = 60*60*24;

function expired(time:number){
    const currentTime = Date.now() / 1000;

    return time < currentTime
}

async function refresh(session:string){
    const refreshRequestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refresh: session
        })
    }
    const responseRefresh = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/api/token/refresh/", refreshRequestOptions); 
    const data = await responseRefresh.json();
    const access = data.access;
    return access;
}

export async function createSession(token:{refresh:string, access:string}){
    const session = token["refresh"]
    const access = token["access"]
    const cookieStore = await cookies();

    cookieStore.set("session",session,{
        httpOnly:true,
        secure:true,
        maxAge:refreshExpiresAt,
        expires:refreshExpiresAt,
        sameSite:"none",
        path:"/",
    });

    cookieStore.set('access',access,{
        httpOnly:true,
        secure:true,
        maxAge:accessExpiresAt,
        expires:accessExpiresAt,
        sameSite:"none",
        path:"/",
    });
}

export async function refreshSession(){
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    try {

        if (session) {
            const { payload } = await jwtVerify(session!, new TextEncoder().encode("kuqsjb2cj4u!=w4cv#qg*q4l#z1!xkm5*ca!*rrt0!w%-r4g&="))
            
            if (!expired(payload.exp!)){
                const access = (await cookies()).get('access')?.value;
                const requestOptions: RequestInit = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization":`Bearer ${access}`,
                    }
                }
                const responseUser = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/userData/", requestOptions);
                const user = await responseUser.json()
                if ("messages" in user) {
                    if (user.messages[0].message == "Token is expired") {
                        const newAccess = await refresh(session);
                        const reRequestOptions: RequestInit = {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization":`Bearer ${newAccess}`,
                            }
                        }
                        const reResponseUser = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/userData/", reRequestOptions);
                        const UserReattempt= await reResponseUser.json();

                        cookieStore.set('access',newAccess,{
                            httpOnly:true,
                            secure:true,
                            maxAge:accessExpiresAt,
                            expires:accessExpiresAt,
                            sameSite:"lax",
                            path:"/"
                        }); 

                        return UserReattempt       
                    }

                    return undefined
                }

                return user
            }
        }

        return undefined
    }
    catch (error) {
        console.log(error)
        return undefined
    }
}

export async function deleteSession(){
    const cookieStore = await cookies();
    const access = (await cookies()).get('access')?.value;
    const session = cookieStore.get('session')?.value;
    
    const requestOptions: RequestInit = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization":`Bearer ${access}`,
            "session": session!
        }
    }
    const response = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/logout/", requestOptions);
    

    cookieStore.delete('session');
    cookieStore.delete('access');
    cookieStore.delete('sessionid')
}

export async function getUserID(pageid:string){
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    const { payload } = await jwtVerify(session!, new TextEncoder().encode("kuqsjb2cj4u!=w4cv#qg*q4l#z1!xkm5*ca!*rrt0!w%-r4g&="))
    revalidatePath(`/articles/details/${pageid}`)
    return payload.user_id
} 

export async function getSession(){

    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const access = cookieStore.get('access')?.value;

    return {
        session: session,
        access: access
    }

}