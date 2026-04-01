import Image from "next/image";
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";

type PageParams = Promise<{ info: string }>;

interface InfoImage {
  altImage: string;
  imageTitle: string;
  imageDescription: string;
  url: string;
}

interface ParagraphListBlock {
  data: string[];
}

type ParagraphContent = string | ParagraphListBlock;

interface InfoSection {
  title: string;
  paragraph: ParagraphContent[];
}

interface ImageGalleryData {
  title: string;
  images: InfoImage[];
}

interface InfoPageData {
  title: string;
  content: {
    info: InfoSection[];
    image_gallery?: ImageGalleryData;
  };
}

function isParagraphListBlock(value: ParagraphContent): value is ParagraphListBlock {
  return typeof value === "object" && value !== null && Array.isArray(value.data);
}

function normalizeRouteValue(value: string): string {
  return decodeURIComponent(value).trim().normalize("NFC");
}

async function readInfoFile(info: string): Promise<InfoPageData> {
  const normalizedInfo = normalizeRouteValue(info);

  const possibleFileNames = [
    `${normalizedInfo}.json`,
    `${normalizedInfo.toLowerCase()}.json`,
  ];

  for (const fileName of possibleFileNames) {
    const filePath = path.join(process.cwd(), "src/_infoData", fileName);

    try {
      const fileContents = await fs.readFile(filePath, "utf-8");
      return JSON.parse(fileContents) as InfoPageData;
    } catch {
      continue;
    }
  }

  notFound();
}

function RenderParagraph({ item }: { item: ParagraphContent }) {
  if (typeof item === "string") {
    return <p>{item}</p>;
  }

  if (isParagraphListBlock(item)) {
    return (
      <ul>
        {item.data.map((listItem, index) => (
          <li key={`${listItem}-${index}`}>{listItem}</li>
        ))}
      </ul>
    );
  }

  return null;
}

function ImageGallery({ data }: { data?: ImageGalleryData }) {
  if (!data || !Array.isArray(data.images) || data.images.length === 0) {
    return null;
  }

  return (
    <div className="row mt-0">
      <div className="col-12">
        <h4>{data.title}</h4>
      </div>

      {data.images.map((img, index) => (
        <div className="col-md-6 col-lg-4 mt-2" key={`${img.url}-${index}`}>
          <Image
            className="rounded"
            src={`/images/${img.url}`}
            alt={img.altImage || img.imageTitle || "Gallery image"}
            width={1000}
            height={667}
            style={{ width: "100%", height: "auto" }}
          />
          <h4 className="mt-3">{img.imageTitle}</h4>
          <p>{img.imageDescription}</p>
        </div>
      ))}
    </div>
  );
}

export default async function Page({ params }: { params: PageParams }) {
  const { info } = await params;
  const itemData = await readInfoFile(info);

  if (!itemData?.content?.info) {
    notFound();
  }

  return (
    <main>
      <section className="pt-1 pb-0">
        <div className="container">
          <div className="row">
            <div className="col mx-auto">
              <h2>{itemData.title}</h2>

              {itemData.content.info.map((section, sectionIndex) => (
                <div key={`${section.title}-${sectionIndex}`}>
                  <h4>{section.title}</h4>

                  {section.paragraph.map((para, paragraphIndex) => (
                    <RenderParagraph
                      key={`${section.title}-paragraph-${paragraphIndex}`}
                      item={para}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <ImageGallery data={itemData.content.image_gallery} />
        </div>
      </section>
    </main>
  );
}