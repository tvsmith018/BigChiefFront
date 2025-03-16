export function requestBody(params:object[], body:any[], variables?:object[]):string{
    let withVars:any;
    const allArticlesString = `
        {
            allArticles(${params.map((value)=>{
                const parameter = Object.entries(value)[0];
                return `${parameter[0]}:${parameter[1]}`
            })}){
                edges{
                    node{
                        ${body.map((value, index)=>{
                            if (typeof(value) === "object"){
                                const obj:any = Object.entries(value)[0]
                                return `${obj[0]}{
                                    ${obj[1].map((val:any,ind:number)=>{
                                        return val.toString()
                                    }).join('\n')}
                                }`
                            }
                            else{                             
                                return value.toString()
                            }
                        }).join('\n')}
                    }
                }
            }
        }
    ` 
    if (variables){
        withVars = `
            query Articles(${variables?.map((value)=>{
                const obj = Object.entries(value)[0]
                return `${obj[0]}:${obj[1]}`
            })})
            ${allArticlesString}
            
        `
    }
    return variables ? withVars:allArticlesString
}