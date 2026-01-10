import { LoginFormState, PasswordResetState, SignupState,LoginSchema, EmailSchema, PasswordSchema, FirstnameSchema, LastnameSchema, DOBSchema } from "../../../datatype/Auth/Schemas/loginFormSchema";
import { createSession, deleteSession } from "../sessions/session";
import { JWTToken } from "../../../datatype/Auth/types/token";
import { ZodObject } from "zod";

function checkFields<T extends Record<string,string>>(schema:ZodObject, fields:T){
    const valid = schema.safeParse(fields);
    return valid
}

export async function loginAction(state: LoginFormState, formData: FormData) {

    const validatedFields = LoginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { email, password } = validatedFields.data;

    const requestBody = {
        email: email,
        password: password
    }

    const requestOptions: RequestInit = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(requestBody)
    };

    try {
        const response = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/login/", requestOptions);

        if (response.ok){
            const token:JWTToken = await response.json();;
            await createSession(token);
            const requestOptions: RequestInit = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":`Bearer ${token['access']}`,
                },
            }

            const responseUser = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/userData/", requestOptions);
        
            if (responseUser.ok) {
                const dataUser = await responseUser.json();
                return dataUser
            }
        }

        return {
            netError: "Please check your credentials and try again.",
        }
    }
    catch (error){
        return {
            netError: "Error with our server. Our Apologies!!!",
        }
    }
}


export async function logoutAction() {
    await deleteSession();
}

export async function passwordResetAction(screen: string, genCode:string|undefined, emailInfo:string|undefined, passwordInfo:string|undefined, state: PasswordResetState, formData: FormData){

    switch (screen){
        case "email-screen":
            const valid = checkFields(EmailSchema, {"email": String(formData.get('email'))})

            if (!valid.success){
                return {
                    errors: valid.error.flatten().fieldErrors
                }
            }

            const { email } = valid.data;
            const emailData = String(email)

            try {
                const requestOptions: RequestInit = {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({email:emailData.toLowerCase(), type:"password-reset"})
                }
                const response = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/generateID/", requestOptions);
                const gen_code = await response.json()

                if (gen_code.message){
                    return {
                        errors: {email: [gen_code.message]}
                    }
                }

                return {
                    screen: "code-screen",
                    code: gen_code.gen_code,
                    payload:{email:emailData, password:undefined}
                }
            }
            catch (error) {
                return {
                    networkError: ["Our Server Is Down. My Bad Yall"]
                }
            }
        case "code-screen":

            let idString = "";
            for (let i:number = 0; i <=5; i++) {
                idString = idString + formData.get(`texbox-${i}`);
            }

            if (idString.length < 6) {
                return {
                    codeError: ["There is an empty box somewhere frfr..."]
                }
            }

            if (genCode != idString) {
                return {
                    codeError: ["Not the right code please try again"]
                }
            }

            return {
                screen: "new-password-screen",
            }
        case "new-password-screen":
            const passwordValid = checkFields(PasswordSchema, {password: String(formData.get('newpassword'))})

            if (!passwordValid.success) {
                return {
                    passwordError: passwordValid.error.flatten().fieldErrors,
                }
            }

            const { password } = passwordValid.data;
            const passData = String(password)

            return {
                screen:"confirm-password-screen",
                payload:{password: passData}
            }
        case "confirm-password-screen":
            const confirm = String(formData.get('confirmnewpassword'));

            if (confirm == "") {
                return {
                    confirmError:["Cannot be blanked!!!"]
                }
            };

            if (confirm != passwordInfo) {
                return {
                    confirmError:["Passwords are not the same!!!!"]
                }
            }

            try {
                const requestOptions: RequestInit = {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email:emailInfo?.toLowerCase(),
                        password:passwordInfo
                    })
                }
                const response = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/resetpassword/", requestOptions);
                const data = await response.json()
                
                if (data.message == "User Do not exist" || data.message == "Password Exist already just use this one Family!!!") {
                    return {
                        networkError: [data.message]
                    }
                }

                return {
                    success:"Password Successfully change",
                    screen:"success-screen"
                }
            } catch {
                return {
                        networkError: ["Our Server Is Down. My Bad Yall"]
                    }
            }


    }   

}

export async function codeResend(email:string){
    try {
        const requestOptions: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email:email.toLowerCase()})
        }
                
        const response = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/generateID/", requestOptions);
        const gen_code = await response.json()

        if (gen_code.message){
            return {
                error: [gen_code.message]
            }
        }

        return {
            code: gen_code.gen_code,
        }
    }
    catch (error) {
        return {
            networkError: ["Our Server Is Down. My Bad Yall"]
        }
    }
}

export async function signupAction(screen: string, genCode:string|undefined, dob:Date|undefined, firstnameInfo:string|undefined, lastnameInfo:string|undefined, emailInfo:string|undefined, passwordInfo:string|undefined , avatarInfo:File|undefined,state: SignupState, formData: FormData){

    switch (screen){
        case "email-screen":
            const valid = checkFields(EmailSchema, {"email": String(formData.get('email'))})
            if (!valid.success){
                return {
                    errors: valid.error.flatten().fieldErrors
                }
            }
            const { email } = valid.data;
            const emailData = String(email)
            try {
                const verifyBody = JSON.stringify({email:emailData.toLowerCase()});
                const requestOptions: RequestInit = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: verifyBody
                }
                const response = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/checkExistance/", requestOptions);
                const data =  await response.json();
                
                if (data.message == "User Exist"){
                    return {
                        networkError: ["User Already exist, please just login!!!"]
                    }
                }

                const requestOptionsCode: RequestInit = {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({email:emailData.toLowerCase(), type:"signup"})
                }

                const responseCode = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/generateID/", requestOptionsCode);
                const gen_code = await responseCode.json()

                return {
                    screen: "code-screen",
                    payload:{email:emailData},
                    gen_code:gen_code.gen_code
                }
            }
            catch (error) {
                return {
                    networkError: ["Our Server Is Down. My Bad Yall"]
                }
            }
        
        case "code-screen":

            let idString = "";
            for (let i:number = 0; i <=5; i++) {
                idString = idString + formData.get(`texbox-${i}`);
            }

            if (idString.length < 6) {
                return {
                    codeError: ["There is an empty box somewhere frfr..."]
                }
            }

            if (genCode != idString) {
                return {
                    codeError: ["Not the right code please try again"]
                }
            }

            return {
                screen: "firstname-screen",
            }
        case "firstname-screen":
            const validfirst = checkFields(FirstnameSchema, {"firstname": String(formData.get('firstname'))});
            
            if (!validfirst.success) {
                return {
                    errors: validfirst.error.flatten().fieldErrors
                }
            }

            const { firstname } = validfirst.data;
            const firstData = String(firstname);

            return {
                screen: "lastname-screen",
                payload: {firstname: firstData}
            }

        case "lastname-screen":
            const validlast = checkFields(LastnameSchema, {"lastname": String(formData.get('lastname'))});
            if (!validlast.success) {
                return {
                    errors: validlast.error.flatten().fieldErrors
                }
            }
            const { lastname } = validlast.data;
            const lastData = String(lastname);

            return {
                screen: "dob-screen",
                payload: {lastname: lastData}
            }
        case "dob-screen":
            const validDOB = checkFields(DOBSchema, {"dob": dob!.toDateString()})
            if (!validDOB.success){
                return {
                    errors: validDOB.error.flatten().fieldErrors
                }
            }
            
            return {
                screen: "image-screen"
            }
        case "image-screen":
            return {
                screen:"new-password-screen"
            }
        case "new-password-screen":
            const passwordValid = checkFields(PasswordSchema, {password: String(formData.get('newpassword'))})

            if (!passwordValid.success) {
                return {
                    passwordError: passwordValid.error.flatten().fieldErrors,
                }
            }

            const { password } = passwordValid.data;
            const passData = String(password)

            return {
                screen:"confirm-password-screen",
                payload:{password: passData}
            }
        case "confirm-password-screen":
            const confirm = String(formData.get('confirmnewpassword'));

            if (confirm == "") {
                return {
                    confirmError:["Cannot be blanked!!!"]
                }
            };

            if (confirm != passwordInfo) {
                return {
                    confirmError:["Passwords are not the same!!!!"]
                }
            }

            const birthdate = dob?.toISOString().split('T')[0]
            const signupForm = new FormData();
            signupForm.append('firstname',firstnameInfo?.toUpperCase() ?? "")
            signupForm.append('lastname',lastnameInfo?.toUpperCase() ?? "")
            signupForm.append('dob', birthdate ?? "")
            signupForm.append('email', emailInfo?.toLowerCase() ?? "")
            signupForm.append('password', passwordInfo)
            signupForm.append('avatar', avatarInfo ?? "")

            const requestOptionsCode: RequestInit = {
                method: "POST",
                body: signupForm
            }

            try {
                const responseCode = await fetch("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/authorized/signup/", requestOptionsCode);
                const data = await responseCode.json()

                if (data.message == "user has successfully signed up"){
                    return {
                        success:"Password Successfully change",
                        screen:"success-screen"
                    }
                }
                else {
                    return {
                        networkError: ["We was not able to sign you up at this time please try again later"]
                    }
                }
            }
            catch {
                return {
                    networkError: ["We was not able to sign you up at this time please try again later"]
                }
            }
 
    }

    return undefined
}