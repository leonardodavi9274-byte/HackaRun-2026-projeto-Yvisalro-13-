import sharp from "sharp";
import type {ImageProcessor} from "../../application/ports/image-processor.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";
export class SharpImageProcessor implements ImageProcessor{
 async process(bytes:Buffer){if(bytes.length>5242880)throw new ApiError(413,"PHOTO_TOO_LARGE","A foto deve ter até 5 MiB.");
 try{const image=sharp(bytes,{failOn:"warning",limitInputPixels:25000000,animated:false});const info=await image.metadata();
 if(!["jpeg","png","webp"].includes(info.format??""))throw new ApiError(415,"PHOTO_FORMAT_UNSUPPORTED","Escolha uma imagem JPEG, PNG ou WebP.");
 if(!info.width||!info.height||info.width*info.height>25000000)throw new ApiError(422,"PHOTO_DIMENSIONS_EXCEEDED","A imagem deve ter até 25 milhões de pixels.");
 return await image.rotate().resize({width:512,height:512,fit:"inside",withoutEnlargement:true}).webp({quality:82}).toBuffer();
 }catch(e){if(e instanceof ApiError)throw e;if(e instanceof Error&&/pixel limit/i.test(e.message))throw new ApiError(422,"PHOTO_DIMENSIONS_EXCEEDED","A imagem deve ter até 25 milhões de pixels.");throw new ApiError(422,"PHOTO_INVALID","Não foi possível ler a imagem. Escolha outra foto.");}}
}
