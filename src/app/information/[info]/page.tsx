import Image from "next/image";
import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

type PageParams = Promise<{ info: string }>;

interface InfoImage {
  altImage: string;
  imageTitle: string;
  imageDescription: string;
  url: string;
}

interface ParagraphListBlock {
  type?: "list";
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

interface NestedContentSection {
  title: string;
  lastUpdated?: string;
  info: InfoSection[];
}

interface InfoPageData {
  title: string;
  content: {
    info?: InfoSection[];
    sections?: NestedContentSection[];
    image_gallery?: ImageGalleryData;
  };
}

function isParagraphListBlock(value: ParagraphContent): value is ParagraphListBlock {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray(value.data)
  );
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

function RenderParagraph({ item }: Readonly<{ item: ParagraphContent }>) {
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

function RenderInfoSections({ sections }: Readonly<{ sections: InfoSection[] }>) {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <div className="mb-4" key={`${section.title}-${sectionIndex}`}>
          <h4>{section.title}</h4>

          {section.paragraph.map((para, paragraphIndex) => (
            <RenderParagraph
              key={`${section.title}-paragraph-${paragraphIndex}`}
              item={para}
            />
          ))}
        </div>
      ))}
    </>
  );
}

function RenderNestedSections({ sections }: Readonly<{ sections: NestedContentSection[] }>) {
  return (
    <>
      {sections.map((sectionGroup, groupIndex) => (
        <div className="mb-5" key={`${sectionGroup.title}-${groupIndex}`}>
          <h3 className="mt-4">{sectionGroup.title}</h3>

          {sectionGroup.lastUpdated ? (
            <p className="text-muted mb-3">
              <strong>Last Updated:</strong> {sectionGroup.lastUpdated}
            </p>
          ) : null}

          <RenderInfoSections sections={sectionGroup.info} />
        </div>
      ))}
    </>
  );
}

function ImageGallery({ data }: Readonly<{ data?: ImageGalleryData }>) {
  if (!data || !Array.isArray(data.images) || data.images.length === 0) {
    return null;
  }

  return (
    <div className="row mt-4">
      <div className="col-12">
        <h4>{data.title}</h4>
      </div>

      {data.images.map((img, index) => (
        <div className="col-md-6 col-lg-4 mt-3" key={`${img.url}-${index}`}>
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

  const hasInfoSections =
    Array.isArray(itemData?.content?.info) && itemData.content.info.length > 0;

  const hasNestedSections =
    Array.isArray(itemData?.content?.sections) &&
    itemData.content.sections.length > 0;

  if (!hasInfoSections && !hasNestedSections) {
    notFound();
  }

  return (
    <main>
      <section className="pt-1 pb-0">
        <div className="container">
          <div className="row">
            <div className="col mx-auto">
              <h2>{itemData.title}</h2>

              {hasInfoSections ? (
                <RenderInfoSections sections={itemData.content.info!} />
              ) : null}

              {hasNestedSections ? (
                <RenderNestedSections sections={itemData.content.sections!} />
              ) : null}
            </div>
          </div>

          <ImageGallery data={itemData.content.image_gallery} />
        </div>
      </section>
    </main>
  );
}