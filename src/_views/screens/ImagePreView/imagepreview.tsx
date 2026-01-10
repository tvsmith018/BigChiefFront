import FormControl from "react-bootstrap/FormControl"
import { useState } from "react";

export default function ImagePreView({setFile}:{setFile:(e:any)=>void}) {
    const [previewUrl, setPreviewUrl] = useState('');
    const handleFileChange = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
    return <>
      {!previewUrl && <div style={{height:"200px", width:"100%", backgroundColor:"gray"}}></div>}
      {previewUrl && <div style={{height:"200px", width:"100%"}}>
        <img src={previewUrl} alt="Preview" style={{ width: '100%', height:"200px" }} />
      </div>}
      <FormControl accept=".jpeg,.png,.jpg" type="file" onChange={handleFileChange} className="mt-3"/>
      <p className="mt-2">Please upload a image to set as your profile picture.  This is optional but highly recommended.</p>
    </>
}