import { useState, useEffect } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const predefinedAmounts = [500, 1000, 2000, 5000];

const Donate = () => {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Keep the pre-filling logic
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setIsProfileLoading(true);
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", user.id)
            .single();

          setDonorInfo(currentInfo => ({
            ...currentInfo,
            name: profileData?.full_name || user.user_metadata.full_name || "",
            email: user.email || "",
            phone: profileData?.phone || "",
          }));
        } catch (error) {
          console.error("Error fetching profile for donation:", error);
          setDonorInfo(currentInfo => ({
             ...currentInfo,
             name: user.user_metadata.full_name || "",
             email: user.email || "",
          }));
        } finally {
          setIsProfileLoading(false);
        }
      };
      fetchProfile();
    } else {
      setIsProfileLoading(false);
    }
  }, [user]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    if (value) {
      setSelectedAmount(parseInt(value) || 0);
    }
  };

  const handleDonate = async () => {
    const finalAmount = isCustom ? parseInt(customAmount) || 0 : selectedAmount;
    
    if (finalAmount < 1) {
      toast.error("Minimum donation amount is ₹1");
      return;
    }

    if (!donorInfo.name || !donorInfo.email) {
      toast.error("Please fill in your name and email");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Initiate payment with the backend to get a transaction ID
     const response = await axios.post(
  `${import.meta.env.VITE_API_BASE_URL}/api/payment/initiate`,
  { // <-- You were missing this opening brace
    amount: finalAmount,
  } // <-- You were missing this closing brace
);

      if (!response.data.success) {
        throw new Error(response.data.message || "Payment initiation failed.");
      }

      const { merchantTransactionId } = response.data.data;
      const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;

      // 2. Create the donation data object
      const donationDetails: TablesInsert<"donations"> = {
        name: donorInfo.name,
        email: donorInfo.email,
        phone: donorInfo.phone || null,
        message: donorInfo.message || null,
        amount: finalAmount
      };

      // 3. Save the pending donation details in localStorage
      localStorage.setItem(`pending_donation_${merchantTransactionId}`, JSON.stringify(donationDetails));

      // 4. Redirect to PhonePe
      window.location.href = redirectUrl;

    } catch (error: any) {
      toast.error("An error occurred while processing your donation. Please try again.");
      console.error("Donation Error:", error);
      setIsProcessing(false);
    }
  };

  const finalAmount = isCustom ? parseInt(customAmount) || 0 : selectedAmount;

  return (
    <div className="pt-24 min-h-screen">
      <section className="section-padding bg-gradient-to-br from-background to-primary/5">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <div className="animate-fade-in">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <HeartIcon className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-8">
              Support <span className="gradient-text">TEDxAUC</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Your generous donation helps us continue spreading ideas worth sharing 
              and creating transformative experiences for our community.
            </p>
          </div>
        </div>
      </section>
      <section className="section-padding">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-8">
                Choose Your <span className="gradient-text">Contribution</span>
              </h2>
              <div className="mb-8">
                <Label className="text-lg font-semibold mb-4 block">Select Amount (₹)</Label>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 font-semibold text-lg ${
                        selectedAmount === amount && !isCustom
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      ₹{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div>
                  <Label htmlFor="custom-amount" className="text-sm font-medium mb-2 block">
                    Or enter custom amount
                  </Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount in ₹"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="text-lg"
                    min="1"
                  />
                </div>
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h2 className="text-3xl font-bold mb-8">
                Your <span className="gradient-text">Information</span>
              </h2>
              {isProfileLoading && user ? (
                 <div className="space-y-6 card-glow p-8">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                 </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="donor-name" className="text-sm font-medium mb-2 block">
                      Full Name *
                    </Label>
                    <Input 
                        id="donor-name" 
                        type="text" 
                        placeholder="Enter your full name" 
                        value={donorInfo.name} 
                        onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})} 
                        required 
                        // REMOVED: disabled={!!user}
                    />
                    {!!user && (
                         <p className="text-xs text-muted-foreground pt-1">
                             Pre-filled from your profile. Feel free to edit if donating for someone else.
                         </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="donor-email" className="text-sm font-medium mb-2 block">
                      Email Address *
                    </Label>
                    <Input 
                        id="donor-email" 
                        type="email" 
                        placeholder="Enter your email address" 
                        value={donorInfo.email} 
                        onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})} 
                        required 
                        // REMOVED: disabled={!!user}
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-phone" className="text-sm font-medium mb-2 block">
                      Phone Number (Optional)
                    </Label>
                    <Input 
                        id="donor-phone" 
                        type="tel" 
                        placeholder="Enter your phone number" 
                        value={donorInfo.phone} 
                        onChange={(e) => setDonorInfo({...donorInfo, phone: e.target.value})} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-message" className="text-sm font-medium mb-2 block">
                      Message (Optional)
                    </Label>
                    <textarea 
                      id="donor-message" 
                      rows={4} 
                      placeholder="Share a message..." 
                      value={donorInfo.message} 
                      onChange={(e) => setDonorInfo({...donorInfo, message: e.target.value})} 
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" 
                    />
                  </div>
                  <div className="card-glow p-6">
                    <h3 className="text-lg font-bold mb-4">Donation Summary</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Donation Amount:</span>
                        <span className="text-2xl font-bold gradient-text">₹{finalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button onClick={handleDonate} disabled={isProcessing || finalAmount < 1} className="w-full hero-button">
                      {isProcessing ? "Processing..." : `Donate ₹${finalAmount.toLocaleString()}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donate;
