// Read-only commerce preview. No order, inventory, or payment mutations belong here.
export const PREVIEW_SHIPPING_ID='00000000-0000-4000-8000-000000000001';
export class PreviewError extends Error {constructor(message,status=400,code='INVALID_INPUT'){super(message);this.status=status;this.code=code;}}
const fail=(message,status,code)=>{throw new PreviewError(message,status,code);};
const gate=enabled=>{if(enabled!==true)fail('Commerce preview is disabled',404,'PREVIEW_DISABLED');};
const money=(n,max=100000000)=>{if(!Number.isSafeInteger(n)||n<0||n>max)fail('Invalid product amount');return n;};
export const previewProducts=products=>products.filter(p=>p.is_active===true||p.slug==='circaden').map(p=>({...p,preview_available:true}));
export function previewShipping(pincode,enabled,rules=[]){
 gate(enabled);if(typeof pincode!=='string'||!/^[1-9]\d{5}$/.test(pincode))fail('Enter a valid Indian pincode');
 const active=rules.filter(r=>r.is_active===true);
 const eligible=active.filter(r=>!r.prefixes?.length||r.prefixes.some(prefix=>pincode.startsWith(prefix))).sort((a,b)=>a.fee_paise-b.fee_paise||a.id.localeCompare(b.id));
 const options=active.length?eligible.map(r=>({id:r.id,label:r.label,fee_paise:r.fee_paise,free_above_paise:r.free_above_paise,estimated_days:'No delivery date is promised',preview:true,courier_connected:false})): [{id:PREVIEW_SHIPPING_ID,label:'Delivery preview - courier not connected',fee_paise:0,estimated_days:'No delivery date is promised',preview:true,courier_connected:false}];
 return {serviceable:!!options.length,preview:true,shipping_configured:false,courier_connected:false,options};
}
export function previewQuote(body,products,enabled,{coupons=[],shippingRules=[],now=Date.now()}={}){
 gate(enabled);const shipping=previewShipping(body.pincode,enabled,shippingRules).options.find(r=>r.id===body.shipping_method);
 if(!shipping)fail('Shipping unavailable',409,'CONFLICT');
 if(typeof (body.coupon_code??'')!=='string'||(body.coupon_code??'').length>40)fail('Invalid coupon code');
 if(!Array.isArray(body.items)||!body.items.length||body.items.length>30)fail('Cart must contain 1â€“30 items');
 const available=previewProducts(products),seen=new Set();let subtotal=0,productDiscount=0,tax=0;
 let items=body.items.map(item=>{
  if(!item||Object.keys(item).some(k=>!['product_id','quantity'].includes(k))||typeof item.product_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product_id)||seen.has(item.product_id.toLowerCase()))fail('Invalid or duplicate product');
  seen.add(item.product_id.toLowerCase());const quantity=item.quantity;
  if(!Number.isSafeInteger(quantity)||quantity<1||quantity>99)fail('Invalid quantity');
  const p=available.find(p=>p.id.toLowerCase()===item.product_id.toLowerCase());
  if(!p||money(p.price_paise)===0)fail('Product unavailable',409,'CONFLICT');
  if(!Number.isSafeInteger(p.stock)||p.stock<quantity)fail('Insufficient stock',409,'CONFLICT');
  const discount=money(p.discount_bps??0,10000),gst=money(p.gst_bps??0,10000);
  const amount=Math.round(p.price_paise*(10000-discount)/10000)*quantity;
  subtotal+=amount;productDiscount+=p.price_paise*quantity-amount;
  const itemTax=Math.round(amount*gst/(10000+gst));tax+=itemTax;
  return {product_id:p.id,name:p.name,slug:p.slug,quantity,unit_price_paise:p.price_paise,line_paise:amount,gst_bps:gst,coupon_discount_paise:0,total_paise:amount,line_total_paise:amount,tax_paise:itemTax};
 });
 let couponDiscount=0;const code=(body.coupon_code??'').trim().toUpperCase();
 if(code){
  const coupon=coupons.find(c=>c.code===code);
  if(!coupon||coupon.is_active!==true||(coupon.starts_at!=null&&Date.parse(coupon.starts_at)>now)||(coupon.ends_at!=null&&Date.parse(coupon.ends_at)<=now)||(coupon.usage_limit!=null&&(coupon.used_count??0)>=coupon.usage_limit)||subtotal<(coupon.min_subtotal_paise??0))fail('Coupon unavailable or minimum not met',409,'CONFLICT');
  if(!['fixed','percent'].includes(coupon.type))fail('Invalid coupon type');
  const value=money(coupon.value,Number.MAX_SAFE_INTEGER);
  const amount=coupon.type==='percent'?roundRatio(BigInt(subtotal)*BigInt(value),10000n):value;
  couponDiscount=Math.min(subtotal,amount,coupon.max_discount_paise==null?subtotal:money(coupon.max_discount_paise,Number.MAX_SAFE_INTEGER));
 }
 let remaining=couponDiscount,leftSubtotal=subtotal;tax=0;
 items=items.map(item=>{
  const amount=item.line_paise;
  const allocation=leftSubtotal===0?0:amount===leftSubtotal?remaining:Number(BigInt(remaining)*BigInt(amount)/BigInt(leftSubtotal));
  const net=amount-allocation;remaining-=allocation;leftSubtotal-=amount;
  const itemTax=roundRatio(BigInt(net)*BigInt(item.gst_bps),BigInt(10000+item.gst_bps));tax+=itemTax;
  return {...item,coupon_discount_paise:allocation,total_paise:net,line_total_paise:net,tax_paise:itemTax};
 });
 const shippingFee=shipping.free_above_paise!=null&&subtotal-couponDiscount>=shipping.free_above_paise?0:money(shipping.fee_paise);
 const total=subtotal-couponDiscount+shippingFee;
 // Keep totals in the same accepted range as validateOrder's expected total.
 money(total);return {items,subtotal_paise:subtotal,product_discount_paise:productDiscount,discount_paise:couponDiscount,shipping_paise:shippingFee,tax_paise:tax,total_paise:total,currency:'INR',tax_inclusive:true,shipping_method:shipping.id,preview:true,payment_configured:false,courier_connected:false};
}
const roundRatio=(numerator,denominator)=>{const rounded=(numerator+denominator/2n)/denominator;if(rounded>BigInt(Number.MAX_SAFE_INTEGER))fail('Invalid amount');return Number(rounded);};
export function previewCheckout(body,products,enabled,rules={}){const quote=previewQuote({...body,pincode:body.shipping_address?.pincode??body.pincode},products,enabled,rules);if(body.expected_total_paise!==quote.total_paise)fail('Cart total changed; review the updated quote',409,'CONFLICT');return {...quote,shipping_configured:false,order_created:false};}

