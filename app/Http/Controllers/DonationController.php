<?php
namespace App\Http\Controllers;
use App\Models\Donation;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
class DonationController extends Controller {
 public function store(Request $request){
  $data=$request->validate(['campaign_id'=>'required|exists:campaigns,id','beneficiary_target_id'=>'nullable|exists:beneficiary_targets,id','donor.name'=>'required|string|max:120','donor.email'=>'nullable|email|max:190','donor.phone'=>'nullable|string|max:30','donation_amount'=>'required|integer|min:5000|max:100000000','operational_support'=>'nullable|integer|min:0|max:10000000','is_anonymous'=>'required|boolean','message'=>'nullable|string|max:500']);
  $campaign=Campaign::whereKey($data['campaign_id'])->whereIn('status',['published','active'])->firstOrFail();
  $donation=DB::transaction(fn()=>Donation::create(['donation_code'=>'SB-'.now()->format('Ymd').'-'.strtoupper(Str::random(8)),'campaign_id'=>$campaign->id,'beneficiary_target_id'=>$data['beneficiary_target_id']??null,'donor_name'=>$data['donor']['name'],'donor_email'=>$data['donor']['email']??null,'donor_phone'=>$data['donor']['phone']??null,'donation_amount'=>$data['donation_amount'],'operational_support'=>$data['operational_support']??0,'is_anonymous'=>$data['is_anonymous'],'message'=>$data['message']??null,'payment_status'=>'pending']));
  return response()->json(['success'=>true,'data'=>['donation_code'=>$donation->donation_code,'total_amount'=>$donation->donation_amount+$donation->operational_support,'payment_status'=>'pending']],201);
 }
 public function status(string $code){$d=Donation::where('donation_code',$code)->firstOrFail();return response()->json(['donation_code'=>$d->donation_code,'payment_status'=>$d->payment_status]);}
}
