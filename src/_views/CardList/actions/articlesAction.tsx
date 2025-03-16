'use server'
import { requestBody } from "../../../../_utilities/network/requestBody"

export async function articlesRetrieve(offset:number, category:string) {

    let params:object[] = [{orderBy:`"-created"`},{offset:offset},{first:12}]
    let legs = ["id","title","image4x3Url","category","badgeColor", "altImage", "created", {author:["firstname","lastname","avatarUrl"]}]
    const vari = [{"$field":"String"}]
    let body;
    if (category == "all") {
        body = {
            query: requestBody(params, legs)
        }
    }
    else {
        if (category == "featured"){
            params.push({typefield:"$field"});
            params.push({exempt:`["none"]`});

            body = {
                query: requestBody(params,legs,vari),
                variables:{
                    "field": "featuredType__in"
                }
            }
        }
        else{
            params.push({category:`"${category}"`});
            body = {
                query: requestBody(params,legs)
            }
        }
    }

    const res = await fetch(process.env.NEXT_PUBLIC_ARTICLEURL ?? "", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify(body)
    })

    const data = await res.json();
    return data.data
}