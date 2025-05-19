"use client"
import Script from 'next/script';
import { useState, useEffect} from "react";

function AdsterraBanner() {
  const [banner, setBanner] = useState({key:"",height:0, width:0})
  const [isClient, setIsClient] = useState(false);

  useEffect(()=>{
    setIsClient(true);
},[isClient]);

  useEffect(() => {
    if (window.innerWidth < 576) {
      setBanner({
        key:'86f941ff71e4308cfcb0d0802ce85da8',
        height: 50,
        width: 320,
      })
    }
    else if (window.innerWidth >= 576 && window.innerWidth < 992){
      setBanner({
        key:'6206869ce9b73e3aca14c46023bc6d83',
        height: 60,
        width: 468,
      })
    }
    else {
      setBanner({
        key:'774c98f6c994745c8ac03c379ddab35e',
        height: 90,
        width: 728,
      })
    }
  },[]);

  return isClient && <>
    <Script type="text/javascript" strategy="afterInteractive">
      {`
        atOptions = {
		      'key' : '${banner.key}',
		      'format' : 'iframe',
		      'height' : ${banner.width},
		      'width' : ${banner.height},
		      'params' : {}
	      };
      `}
    </Script>
        
    <Script type="text/javascript" src={`//spaniardinformationbookworm.com/${banner.key}/invoke.js`} strategy="afterInteractive"/>
  </>
}

export default AdsterraBanner