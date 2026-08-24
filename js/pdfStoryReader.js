(function(){
 let pdfjsPromise=null;
 function library(){
  if(!pdfjsPromise)pdfjsPromise=import('../assets/vendor/pdfjs/pdf.min.mjs').then(pdfjs=>{
   pdfjs.GlobalWorkerOptions.workerSrc=new URL('../assets/vendor/pdfjs/pdf.worker.min.mjs',document.baseURI).href;
   return pdfjs;
  });
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
 async function pageArtwork(page){
  const base=page.getViewport({scale:1}),scale=Math.min(1.25,720/base.width);
  const viewport=page.getViewport({scale}),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.floor(viewport.width));canvas.height=Math.max(1,Math.floor(viewport.height));
  const context=canvas.getContext('2d',{alpha:false});
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
  await page.render({canvasContext:context,viewport}).promise;
  return canvas.toDataURL('image/jpeg',.62);
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
   const pages=[],pageImages=[];let artworkSize=0;
   for(let number=1;number<=pageCount;number+=1){
    onProgress?.(number,pageCount);
    const page=await pdf.getPage(number),content=await page.getTextContent();
    const text=joinItems(content.items);
    if(text)pages.push(text);
    if(pageImages.length<8&&artworkSize<1500000){
     const image=await pageArtwork(page);
     if(artworkSize+image.length<=1500000){pageImages.push(image);artworkSize+=image.length}
    }
    if(typeof page.cleanup==='function')page.cleanup();
   }
   const extractedText=pages.join('\n\n'),hasExtractedText=extractedText.replace(/\s/g,'').length>=20;
   const text=hasExtractedText?extractedText:Array.from({length:Math.min(pageCount,12)},(_,i)=>`Illustrated page ${i+1}`).join('\n\n');
   if(!hasExtractedText&&!pageImages.length)throw new Error('This PDF did not contain readable text or pictures. Try another copy or paste the story text instead.');
   return {text,pageCount,fileName:file.name,pageImages,hasExtractedText};
  }finally{
   try{
    if(pdf&&typeof pdf.destroy==='function')await pdf.destroy();
    else if(typeof task.destroy==='function')await task.destroy();
   }catch{ /* Cleanup should never block a successfully extracted story. */ }
  }
 }
 window.PdfStoryReader={extract};
})();
