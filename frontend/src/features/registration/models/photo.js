export async function validatePhoto(file){
 if(!file||file.size>5242880)throw new Error("Escolha uma foto de até 5 MiB.");
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const mime=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?"image/jpeg":bytes.slice(0,8).join(",")==="137,80,78,71,13,10,26,10"?"image/png":String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP"?"image/webp":null;
 if(!mime)throw new Error("Escolha uma imagem JPEG, PNG ou WebP.");
 const normalized=new File([file],file.name,{type:mime,lastModified:file.lastModified});let bitmap;
 try{bitmap=await createImageBitmap(normalized);if(bitmap.width*bitmap.height>25000000)throw new Error("A foto deve ter até 25 milhões de pixels.");}catch(e){if(e.message.includes("25 milhões"))throw e;throw new Error("Não foi possível ler a imagem. Escolha outra foto.");}finally{bitmap?.close();}
 return normalized;
}
