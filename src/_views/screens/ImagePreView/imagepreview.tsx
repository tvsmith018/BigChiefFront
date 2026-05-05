import FormControl from "react-bootstrap/FormControl"
import { useState, Dispatch, SetStateAction } from "react";
import Image from "next/image";

type ImagePreViewProps = {
  setFile: Dispatch<SetStateAction<File | undefined>>;
};

export default function ImagePreView({ setFile }: Readonly<ImagePreViewProps>) {
  const [previewUrl, setPreviewUrl] = useState('');
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return <>
    {!previewUrl && <div style={{height:"200px", width:"100%", backgroundColor:"gray"}}></div>}
    {previewUrl && (
      <div
        style={{
          position: "relative",
          height: "200px",
          width: "100%",
        }}
      >
        <Image
          src={previewUrl}
          alt="Preview"
          fill
          unoptimized
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>
    )}
    <FormControl accept=".jpeg,.png,.jpg" type="file" onChange={handleFileChange} className="mt-3"/>
    <p className="mt-2">Please upload a image to set as your profile picture.  This is optional but highly recommended.</p>
  </>
}