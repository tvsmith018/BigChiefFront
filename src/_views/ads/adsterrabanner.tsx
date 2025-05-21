"use client"
import {useEffect, useRef} from "react";

function AdsterraBanner() {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(()=>{
    if (ref.current && !ref.current.firstChild) {
      let atOptions:{key:string,format:string, height:number, width:number, params:object};
      if (window.innerWidth < 576) {
        atOptions = {
          'key' : '86f941ff71e4308cfcb0d0802ce85da8',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      }
      else if (window.innerWidth >= 576 && window.innerWidth < 992) {
        atOptions = {
          'key' : '6206869ce9b73e3aca14c46023bc6d83',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      }
      else {
        atOptions = {
          'key' : '774c98f6c994745c8ac03c379ddab35e',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      }
      const conf = document.createElement('script');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//spaniardinformationbookworm.com/${atOptions.key}/invoke.js`;
      conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;
      ref.current.append(conf)
      ref.current.append(script)
    }
  },[ref])
  return <div ref={ref}></div>
}

export default AdsterraBanner