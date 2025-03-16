'use server'
import { requestBody } from "../../../../../_utilities/network/requestBody"

export async function searchResults(url:string, searchvalue:string) {
    const raw = await fetch(url,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query:requestBody([{orderBy:`"-created"`},{ search:`"${searchvalue}"`}, {first:5}],["image1x1Url","altImage","title","id"])
        })
    })

    const data = await raw.json()
    return data.data.allArticles.edges
}