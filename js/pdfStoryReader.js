(function(){
 let pdfjsPromise=null;
 function library(){
  const pdfAssetBase=new URL('./assets/vendor/pdfjs/',document.baseURI);
  if(!pdfjsPromise)pdfjsPromise=import(new URL('pdf.min.mjs',pdfAssetBase).href).then(pdfjs=>{
   pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdf.worker.min.mjs',pdfAssetBase).href;
   return pdfjs;
  }).catch(error=>{pdfjsPromise=null;throw error});
  return pdfjsPromise;
 }
 function joinItems(items){
  let text='',lastY=null;
  for(const item of items){
   if(!item.str)continue;
   const y=Math.round(item.transform?.[5]||0);
   if(lastY!==null&&Math.abs(y-lastY)>5)text+='\n';
   else if(text&&!text.endsWith('\n')&&!text.endsWith(' '))text+=' ';
   text+=item.str.trim();
   lastY=y;
  }
  return text.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
 }
 function compressCanvas(canvas,targetSize){
  let current=canvas,result='',quality=.62;
  for(let attempt=0;attempt<11;attempt+=1){
   result=current.toDataURL('image/jpeg',quality);
   if(result.length<=targetSize)break;
   const smaller=document.createElement('canvas');smaller.width=Math.max(120,Math.round(current.width*.78));smaller.height=Math.max(160,Math.round(current.height*.78));
   const smallerContext=smaller.getContext('2d',{alpha:false});smallerContext.fillStyle='#fff';smallerContext.fillRect(0,0,smaller.width,smaller.height);smallerContext.drawImage(current,0,0,smaller.width,smaller.height);current=smaller;quality=Math.max(.28,quality-.045);
  }
  return result;
 }
 function fallbackArtwork(text,number,targetSize){
  const canvas=document.createElement('canvas');canvas.width=600;canvas.height=800;const context=canvas.getContext('2d',{alpha:false});
  context.fillStyle='#f8efd9';context.fillRect(0,0,canvas.width,canvas.height);context.strokeStyle='#c49a52';context.lineWidth=5;context.strokeRect(24,24,552,752);context.fillStyle='#4a2d24';context.textAlign='center';context.font='bold 25px sans-serif';context.fillText(`PAGE ${number}`,300,72);context.textAlign='left';context.font='22px sans-serif';
  const words=String(text||`Illustrated page ${number}`).split(/\s+/);let line='',y=125;for(const word of words){const next=line?`${line} ${word}`:word;if(context.measureText(next).width>500){context.fillText(line,50,y);line=word;y+=34;if(y>735)break}else line=next}if(line&&y<=735)context.fillText(line,50,y);
  return compressCanvas(canvas,targetSize);
 }
 async function pageArtwork(page,targetSize=180000){
  const base=page.getViewport({scale:1}),scale=Math.min(1,640/base.width,900/base.height);
  const viewport=page.getViewport({scale}),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.floor(viewport.width));canvas.height=Math.max(1,Math.floor(viewport.height));
  const context=canvas.getContext('2d',{alpha:false});
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
  await page.render({canvas,canvasContext:context,viewport}).promise;
  return compressCanvas(canvas,targetSize);
 }
 async function extract(file,onProgress){
  if(!file||(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf'))throw new Error('Choose a PDF story file.');
  if(file.size>30*1024*1024)throw new Error('That PDF is too large. Choose one under 30 MB.');
  const pdfjs=await library(),data=new Uint8Array(await file.arrayBuffer());
  const task=pdfjs.getDocument({data,isEvalSupported:false});
  let pdf=null;
  try{
   pdf=await task.promise;
   const pageCount=pdf.numPages;
   if(pageCount>150)throw new Error('That story has too many pages. Choose a PDF with 150 pages or fewer.');
   const pages=[],pageImages=[],importCount=Math.min(pageCount,24),pageBudget=Math.floor(2050000/importCount);let artworkSize=0;
   for(let number=1;number<=importCount;number+=1){
    onProgress?.(number,importCount);
    const page=await pdf.getPage(number);let text='',image='';
    try{
     try{const content=await page.getTextContent();text=joinItems(content.items)}catch(error){console.warn(`PDF page ${number} text recovery:`,error)}
     if(artworkSize<2200000){
      try{const candidate=await pageArtwork(page,pageBudget);if(candidate&&artworkSize+candidate.length<=2200000){image=candidate;pageImages.push(candidate);artworkSize+=candidate.length}}catch(error){console.warn(`PDF page ${number} artwork recovery:`,error)}
     }
     if(!image){const recovered=fallbackArtwork(text,number,pageBudget);if(recovered&&artworkSize+recovered.length<=2200000){image=recovered;pageImages.push(recovered);artworkSize+=recovered.length}}
     pages.push({pageNumber:number,text,image});
    }finally{if(typeof page.cleanup==='function')page.cleanup()}
   }
   const extractedText=pages.map(page=>page.text).filter(Boolean).join('\n\n'),hasExtractedText=extractedText.replace(/\s/g,'').length>=20;
   const text=hasExtractedText?extractedText:pages.slice(0,24).map(page=>`Illustrated page ${page.pageNumber}`).join('\n\n');
   if(!hasExtractedText&&!pageImages.length)throw new Error('This PDF did not contain readable text or pictures. Try another copy or paste the story text instead.');
   return {text,pageCount,fileName:file.name,pageImages,pages:pages.map(page=>({...page,text:page.text||`Illustrated page ${page.pageNumber}`})),hasExtractedText};
  }finally{
   try{
    if(pdf&&typeof pdf.destroy==='function')await pdf.destroy();
    else if(typeof task.destroy==='function')await task.destroy();
   }catch{ /* Cleanup should never block a successfully extracted story. */ }
  }
 }
 window.PdfStoryReader={extract};
})();
