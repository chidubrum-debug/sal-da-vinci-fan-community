import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
const headers={"Content-Type":"application/json","Cache-Control":"no-store"};
const json=(statusCode,body)=>({statusCode,headers,body:JSON.stringify(body)});
export async function handler(event){
 if(event.httpMethod!=="POST")return json(405,{error:"Method not allowed"});
 try{
  const b=JSON.parse(event.body||"{}");
  const required=["full_name","email","phone","address","city","date_of_birth","country","membership_type"];
  if(required.some(k=>typeof b[k]!=="string"||!b[k].trim())||!["membership","fan"].includes(b.membership_type)||b.privacy_consent!==true)return json(400,{error:"Please complete all required fields and consent."});
  if((b.membership_type==="membership"&&!['Silver','Gold','Platinum'].includes(b.membership_tier))||(b.membership_type==="fan"&&b.membership_tier))return json(400,{error:"Please choose a valid membership tier."});
  if(b.full_name.length>120||b.email.length>254||b.phone.length>30||b.address.length>180||b.city.length>100||b.country.length>80||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(b.date_of_birth))return json(400,{error:"Invalid application details."});
  if(b.photo&&b.photo_consent!==true)return json(400,{error:"Photo consent is required."});
  let attachment;
  if(b.photo){
   if(!["image/jpeg","image/png","image/webp"].includes(b.photo.type)||typeof b.photo.base64!=="string"||b.photo.base64.length>4_200_000)return json(400,{error:"Invalid photo or photo too large."});
   const buffer=Buffer.from(b.photo.base64,"base64");if(buffer.length>3*1024*1024)return json(400,{error:"Photo exceeds 3 MB."});
   const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[b.photo.type];
   attachment={filename:`applicant-photo.${ext}`,content:buffer.toString("base64")};
  }
  if(attachment&&(!process.env.RESEND_API_KEY||!process.env.MAIL_FROM||!process.env.ADMIN_EMAIL))return json(503,{error:"Photo email delivery is not configured yet. Please submit without a photo or try again later."});
  const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
  const reference="SDV-"+randomUUID().slice(0,8).toUpperCase();
  const {error}=await supabase.from("applications").insert({reference,full_name:b.full_name.trim(),email:b.email.trim().toLowerCase(),phone:b.phone.trim(),address:b.address.trim(),city:b.city.trim(),date_of_birth:b.date_of_birth,country:b.country.trim(),membership_type:b.membership_type,membership_tier:b.membership_tier,status:"pending",photo_consent:!!b.photo&&b.photo_consent===true});
  if(error)throw error;
  let notificationSent=false;
  if(process.env.RESEND_API_KEY&&process.env.MAIL_FROM&&process.env.ADMIN_EMAIL){
   const mail={from:process.env.MAIL_FROM,to:[process.env.ADMIN_EMAIL],subject:`Fan community application ${reference}`,text:`New ${b.membership_type} application from ${b.full_name} (${b.email}), phone ${b.phone}, address ${b.address}, city ${b.city}, date of birth ${b.date_of_birth}, country ${b.country}. Reference: ${reference}.${attachment?" Applicant consented to the attached profile photo being emailed.":" No photo was attached."}`,...(attachment?{attachments:[attachment]}:{})};
   const resp=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify(mail)});
   notificationSent=resp.ok;
  }
  return json(200,{ok:true,reference,notificationSent,notice:notificationSent?undefined:"Application saved, but administrator email notification is not configured or could not be delivered."});
 }catch(e){console.error("submit-application:",e.message);return json(500,{error:e.message||"Server error"});}
}
