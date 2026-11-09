<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Donation;
class PaymentWebhookController extends Controller {
 public function handle(Request $request){
  // Production: verify Midtrans signature_key using order_id + status_code + gross_amount + server key.
  // Then fetch transaction status from Midtrans API; never trust browser redirects or raw webhook alone.
  $payload=$request->all();
  if(!isset($payload['order_id'],$payload['transaction_status'],$payload['status_code'],$payload['gross_amount'],$payload['signature_key'])) return response()->json(['message'=>'Invalid payload'],422);
  $expected=hash('sha512',$payload['order_id'].$payload['status_code'].$payload['gross_amount'].config('services.midtrans.server_key'));
  if(!hash_equals($expected,$payload['signature_key'])) return response()->json(['message'=>'Invalid signature'],403);
  $donation=Donation::where('donation_code',$payload['order_id'])->lockForUpdate()->first();
  if(!$donation)return response()->json(['message'=>'Unknown order'],404);
  if(in_array($payload['transaction_status'],['settlement','capture']) && $donation->payment_status!=='paid') $donation->update(['payment_status'=>'paid']);
  elseif($payload['transaction_status']==='expire')$donation->update(['payment_status'=>'expired']);
  elseif(in_array($payload['transaction_status'],['deny','cancel']))$donation->update(['payment_status'=>'failed']);
  return response()->json(['message'=>'OK']);
 }
}
