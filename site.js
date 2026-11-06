import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cfg = window.PUBLIC_CONFIG || {};
const $ = (s) => document.querySelector(s);
const translations = {
  it:{navAbout:"La community",navJoin:"Iscriviti",navPayments:"Pagamenti",eyebrow:"UNA COMMUNITY INDIPENDENTE DI FAN",heroTitle:'La musica ci unisce.<br><em>La passione ci avvicina.</em>',heroCopy:"Uno spazio creato dai fan, per condividere l'amore per la musica di Sal Da Vinci.",joinButton:"Entra nella community",disclaimer:"Community indipendente, non ufficiale e non affiliata a Sal Da Vinci o ai suoi rappresentanti.",aboutEyebrow:"BENVENUTO",aboutTitle:"Una passione da vivere insieme.",aboutCopy:"Connettiti con altri appassionati, ricevi aggiornamenti della community e scegli la tua card. Questa iniziativa è gestita in modo indipendente dai fan.",applyEyebrow:"FAI PARTE DELLA COMMUNITY",applyTitle:"Scegli la tua card",applyCopy:"Compila la richiesta. Il team della community la esaminerà e ti contatterà via email.",memberDesc:"Richiesta di adesione",fanDesc:"Richiesta fan",fullName:"Nome completo",phone:"Telefono",address:"Indirizzo",city:"Città",dateOfBirth:"Data di nascita",country:"Paese",photo:"Foto profilo (facoltativa)",photoHelp:"Massimo 3 MB. La foto viene inviata all'amministratore solo con il tuo consenso e non viene salvata sul sito.",photoConsent:"Acconsento all'invio della foto caricata all'amministratore via email per questa richiesta. La foto non sarà pubblicata.",privacyConsent:"Confermo di aver letto l'informativa e acconsento al trattamento dei dati per gestire la mia richiesta.",submitApplication:"Invia richiesta",paymentEyebrow:"PAGAMENTI",paymentTitle:"Metodi di pagamento",paymentCopy:"I metodi non ancora attivati sono indicati come non disponibili. Non inviare codici segreti o PIN di gift card.",unavailable:"Non disponibile al momento",providerPending:"In attesa di integrazione sicura",giftHelp:"Carica solo una prova di acquisto, con numeri della carta, PIN, codici a barre e codici di riscatto completamente coperti.",giftAvailable:"Disponibile per inviare una prova",giftPanelTitle:"Prova di acquisto della gift card",giftPanelCopy:"Carica solo una ricevuta o una prova di acquisto. Copri ogni numero della carta, PIN, codice a barre e codice riscattabile prima di selezionare l’immagine.",giftImageLabel:"Scegli l’immagine della prova",giftImageHelp:"JPG, PNG o WebP · massimo 3 MB · questa anteprima non invia né salva l’immagine.",giftRedaction:"Confermo che tutti i numeri della gift card, PIN, codici a barre e codici riscattabili sono completamente nascosti.",giftProcess:"Elabora immagine",footerNote:"Community indipendente · Nessuna affiliazione ufficiale"},
  en:{navAbout:"About",navJoin:"Join",navPayments:"Payments",eyebrow:"AN INDEPENDENT FAN COMMUNITY",heroTitle:'Music brings us together.<br><em>Passion brings us closer.</em>',heroCopy:"A fan-created space to share a love of Sal Da Vinci's music.",joinButton:"Join the community",disclaimer:"Independent, unofficial community. Not affiliated with or endorsed by Sal Da Vinci or his representatives.",aboutEyebrow:"WELCOME",aboutTitle:"A passion to share together.",aboutCopy:"Connect with fellow fans, receive community updates and choose your card. This initiative is independently run by fans.",applyEyebrow:"BECOME PART OF THE COMMUNITY",applyTitle:"Choose your card",applyCopy:"Submit your application. The community team will review it and contact you by email.",memberDesc:"Membership request",fanDesc:"Fan request",fullName:"Full name",phone:"Phone number",address:"Address",city:"City",dateOfBirth:"Date of birth",country:"Country",photo:"Profile picture (optional)",photoHelp:"Maximum 3 MB. Your picture is emailed to the administrator only with your consent and is not stored on the website.",photoConsent:"I consent to sending my uploaded picture to the administrator by email for this request. It will not be published.",privacyConsent:"I have read the privacy notice and consent to processing my details to manage this request.",submitApplication:"Submit application",paymentEyebrow:"PAYMENTS",paymentTitle:"Payment methods",paymentCopy:"Methods not yet activated are marked unavailable. Never submit gift-card PINs or redeemable codes.",unavailable:"Currently unavailable",providerPending:"Awaiting secure provider integration",giftHelp:"Upload proof of purchase only, with all gift-card numbers, PINs, barcodes and redemption codes fully covered.",giftAvailable:"Available to submit proof",giftPanelTitle:"Gift card proof of purchase",giftPanelCopy:"Upload a receipt or proof-of-purchase image only. Cover every card number, PIN, barcode and redeemable code before selecting the image.",giftImageLabel:"Choose proof image",giftImageHelp:"JPG, PNG or WebP · maximum 3 MB · this preview does not send or store your image.",giftRedaction:"I confirm all gift-card numbers, PINs, barcodes and redemption codes are completely hidden.",giftProcess:"Process image",footerNote:"Independent community · No official affiliation"}
};
function setLanguage(lang){document.documentElement.lang=lang;document.querySelectorAll("[data-i18n]").forEach(el=>{const value=translations[lang]?.[el.dataset.i18n];if(value!==undefined)el.innerHTML=value;});}
$("#language")?.addEventListener("change",e=>setLanguage(e.target.value));
$("#year").textContent=new Date().getFullYear();
// Page-style navigation: switch views and browser history without anchor scrolling.
const pageSections=[...document.querySelectorAll(".page-section")];
function showPage(page,{push=true}={}){
 const target=pageSections.find(section=>section.dataset.page===page)||pageSections[0];
 pageSections.forEach(section=>{const active=section===target;section.classList.toggle("active",active);section.setAttribute("aria-hidden",String(!active));});
 if(push)history.pushState({page:target.dataset.page},"",`#${target.dataset.page}`);
 window.scrollTo({top:0,behavior:"instant"});
}
function currentPage(){return location.hash.replace("#","")||"home";}
const tierWrap=$("#membership-tier-wrap");
function syncTierChoice(){const type=document.querySelector('input[name="membership_type"]:checked')?.value;const show=type==="membership";tierWrap.hidden=!show;tierWrap.querySelectorAll('input[name="membership_tier"]').forEach(input=>{input.required=show;if(!show)input.checked=false;});}
document.querySelectorAll('input[name="membership_type"]').forEach(input=>input.addEventListener("change",syncTierChoice));syncTierChoice();
document.addEventListener("click",event=>{
 const packageCard=event.target.closest("[data-open-package]");
 if(packageCard){const type=packageCard.dataset.openPackage;const radio=document.querySelector(`input[name="membership_type"][value="${type}"]`);if(radio)radio.checked=true;showPage("apply");return;}
 const link=event.target.closest('a[href^="#"]');
 if(link){const page=link.getAttribute("href").slice(1);if(pageSections.some(section=>section.dataset.page===page)){event.preventDefault();showPage(page);}}
});
window.addEventListener("popstate",()=>showPage(currentPage(),{push:false}));
if(pageSections.some(section=>section.dataset.page===currentPage()))showPage(currentPage(),{push:false});

const form=$("#application-form");
form?.addEventListener("submit",async e=>{
 e.preventDefault(); const status=$("#application-status"); const btn=form.querySelector('button[type="submit"]');
 if(!cfg.supabaseUrl||!cfg.supabaseAnonKey){status.textContent="Setup required: configure the public Supabase settings before accepting applications.";return;}
 const data=new FormData(form); const file=$("#profile-photo").files[0]; const consent=$("#photo-consent").checked;
 if(file&&(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>3*1024*1024)){status.textContent="Please choose a JPG, PNG or WebP image under 3 MB.";return;}
 if(file&&!consent){status.textContent="Please consent to emailing the picture, or remove the picture.";return;}
 btn.disabled=true;status.textContent="Sending securely…";
 try{
  let photo=null;
  if(file){photo={name:file.name,type:file.type,base64:await toBase64(file)};}
  const payload={full_name:data.get("full_name"),email:data.get("email"),phone:data.get("phone"),address:data.get("address"),city:data.get("city"),date_of_birth:data.get("date_of_birth"),country:data.get("country"),membership_type:data.get("membership_type"),membership_tier:data.get("membership_tier")||null,privacy_consent:data.get("privacy_consent")==="on",photo_consent:consent,photo};
  const startedAt=Date.now();
  const response=await fetch("/.netlify/functions/submit-application",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const result=await response.json();if(!response.ok)throw new Error(result.error||"Unable to submit application.");
  await new Promise(resolve=>setTimeout(resolve,Math.max(0,10000-(Date.now()-startedAt))));
  form.reset();status.textContent="Thank you! Your application was received. Reference: "+result.reference;
 }catch(err){status.textContent=err.message;}finally{btn.disabled=false;}
});
// Safe local preview only: no gift-card credentials are collected and no image is transmitted.
const giftOpen=$("#gift-card-open"), giftPanel=$("#gift-card-panel"), giftFile=$("#gift-proof-image"), giftConfirm=$("#gift-redaction-confirm"), giftProcess=$("#gift-process"), giftPreviewWrap=$("#gift-preview-wrap"), giftPreview=$("#gift-proof-preview"), giftProgress=$("#gift-progress"), giftFill=$("#gift-progress-fill"), giftProgressText=$("#gift-progress-text"), giftResult=$("#gift-result");
let giftObjectUrl=null;
giftOpen?.addEventListener("click",()=>{const opening=giftPanel.hidden;giftPanel.hidden=!opening;giftOpen.setAttribute("aria-expanded",String(opening));});
function validateGiftProof(){const file=giftFile?.files?.[0];const valid=file&&["image/jpeg","image/png","image/webp"].includes(file.type)&&file.size<=3*1024*1024;giftProcess.disabled=!(valid&&giftConfirm.checked);if(file&&!valid)giftResult.textContent="Choose a JPG, PNG or WebP image under 3 MB.";else giftResult.textContent="";}
giftFile?.addEventListener("change",()=>{const file=giftFile.files[0];if(giftObjectUrl)URL.revokeObjectURL(giftObjectUrl);giftObjectUrl=null;giftPreviewWrap.hidden=true;if(file&&["image/jpeg","image/png","image/webp"].includes(file.type)&&file.size<=3*1024*1024){giftObjectUrl=URL.createObjectURL(file);giftPreview.src=giftObjectUrl;giftPreviewWrap.hidden=false;}validateGiftProof();});
giftConfirm?.addEventListener("change",validateGiftProof);
giftProcess?.addEventListener("click",()=>{if(giftProcess.disabled)return;giftProcess.disabled=true;giftFile.disabled=true;giftConfirm.disabled=true;giftProgress.hidden=false;giftResult.textContent="";let elapsed=0;giftFill.style.width="0%";giftProgressText.textContent="Processing preview… 0%";const timer=setInterval(()=>{elapsed+=1;const percent=Math.min(100,Math.round(elapsed/60*100));giftFill.style.width=percent+"%";giftProgressText.textContent="Processing preview… "+percent+"%";if(elapsed>=60){clearInterval(timer);giftProgressText.textContent="Preview processing complete.";giftResult.textContent="Preview complete. No image was uploaded or sent, no payment was verified, and no administrator received this file. Connect a secure, authorized payment-verification provider before accepting gift-card payments.";giftFile.disabled=false;giftConfirm.disabled=false;giftProcess.disabled=false;}} ,1000);});
function toBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(",")[1]);r.onerror=reject;r.readAsDataURL(file);});}
