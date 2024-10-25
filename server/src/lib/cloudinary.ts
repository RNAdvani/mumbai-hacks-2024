import {v2} from 'cloudinary'
import fs from 'fs'

export const uploadOnCloudinary = async (filepath:string)=>{
    try {
        if(!filepath) return null;
        const res = await v2.uploader.upload(filepath,{
            resource_type:'auto'
        })
        fs.unlinkSync;
        return res;
    } catch (error) {
        console.log(error);
        fs.unlinkSync;
        return null;
    }  
}