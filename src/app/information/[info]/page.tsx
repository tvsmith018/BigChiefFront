import Image from "next/image";
import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';

type aParams = Promise<{ info:string }>;

interface InfoImgProps {
    altImage:string, 
    imageTitle:string, 
    imageDescription:string, 
    url:string
}

interface GalleryProps {
    data: {
        title: string,
        images: []
    }
}

function ImageGallery(props:GalleryProps){
    const data = props.data;

    if (data == undefined){
        return <></>
    }

    return (
        <div className="row mt-0">
            <h4>{data.title}</h4>
            {
                data.images.map(async (img:InfoImgProps, index:number) => {

                    return(
                        <div className="col-md-6 col-lg-4 mt-2" key={index}>
                            <Image className="rounded" src={`/images/${img.url}`} alt={`${img["altImage"]}`} width={1000} height={667} style={{width:"auto", height:"auto"}}/>
                            <h4 className="mt-3">{img["imageTitle"]}</h4>
                            <p>{img["imageDescription"]}</p>
                        </div>
                    )
                })
            }
        </div>
    )

}

export default async function Page({params}:{params:aParams}){
    const {info} = await params

    try {
        const filePath = path.join(process.cwd(), 'infoData', `${info.toLowerCase()}.json`);
        const fileContents = await fs.readFile(filePath, 'utf-8');

        const itemData = JSON.parse(fileContents);

        return (
            <main>
                <section className="pt-1 pb-0">
                    <div className="container">
                        <div className="row">
                            <div className="col mx-auto">
                                <h2>{itemData.title}</h2>
                                {itemData.content.info.map((dataInfo:{title:string, paragraph:[]}, index:number)=>{
                                    return(
                                        <div key={index}>
                                            <h4>{dataInfo.title}</h4>
                                            {dataInfo.paragraph.map((para:string|{data:[]}, index:number)=>{
                                                let content;
                                                if (typeof(para) == "string"){
                                                    content=<p key={index}>{para}</p>
                                                }
                                                else{
                                                    content=<ul key={index}>
                                                        {
                                                            para["data"].map((item:string, index:number) =>{
                                                                return <li key={index}>{item}</li>
                                                            })
                                                        }
                                                    </ul>
                                                }
    
                                                return content
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <ImageGallery 
                            data={itemData.content.image_gallery}
                        />
                    </div>
                </section>
            </main>
        )
    }
    catch {
        notFound()
    }

}