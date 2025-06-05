import { useState } from "react";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  freeRequestsUsed: number;
  freeRequestsLimit: number;
}

const CheckoutForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Activated!",
        description: "You now have unlimited access to the SEO Analytics platform.",
      });
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
      >
        {isLoading ? "Processing..." : "Subscribe for $20/month"}
      </Button>
    </form>
  );
};

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  freeRequestsUsed, 
  freeRequestsLimit 
}: SubscriptionModalProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

  const createSubscription = async () => {
    setIsCreatingSubscription(true);
    try {
      const response = await apiRequest("POST", "/api/create-subscription");
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error creating subscription:", error);
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  const handleSuccess = () => {
    onClose();
    // Refresh the page to update subscription status
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            You've used {freeRequestsUsed} of {freeRequestsLimit} free requests
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Free requests used:</span>
                  <Badge variant={freeRequestsUsed >= freeRequestsLimit ? "destructive" : "secondary"}>
                    {freeRequestsUsed} / {freeRequestsLimit}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      freeRequestsUsed >= freeRequestsLimit ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min((freeRequestsUsed / freeRequestsLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Plan */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl text-center">Pro Plan</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-3xl font-bold">$20<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-2 text-sm">
                <li>✓ Unlimited Search Console requests</li>
                <li>✓ AI-powered insights and recommendations</li>
                <li>✓ Advanced analytics and reporting</li>
                <li>✓ Priority support</li>
                <li>✓ Cancel anytime</li>
              </ul>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {!clientSecret ? (
            <Button 
              onClick={createSubscription} 
              disabled={isCreatingSubscription}
              className="w-full"
            >
              {isCreatingSubscription ? "Setting up..." : "Continue to Payment"}
            </Button>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm onSuccess={handleSuccess} />
            </Elements>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}