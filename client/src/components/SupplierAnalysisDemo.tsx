import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSuppliers, getSupplierAnalysis, type SupplierAnalysis } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, Star } from "lucide-react";

export default function SupplierAnalysisDemo() {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  
  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/suppliers"],
    queryFn: getSuppliers,
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: [`/api/suppliers/${selectedSupplierId}/analysis`],
    queryFn: () => selectedSupplierId ? getSupplierAnalysis(selectedSupplierId) : null,
    enabled: !!selectedSupplierId,
  });

  const getSafetyColor = (rating: number) => {
    if (rating >= 4.0) return "text-green-600";
    if (rating >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getSafetyBadge = (rating: number) => {
    if (rating >= 4.0) return { text: "Highly Recommended", variant: "default" as const };
    if (rating >= 3.0) return { text: "Proceed with Caution", variant: "secondary" as const };
    return { text: "Extra Verification Required", variant: "destructive" as const };
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">🤖 AI Supplier Safety Analyzer</h3>
        <p className="text-muted-foreground">
          Click on a supplier to see their AI-generated safety rating and analysis
        </p>
      </div>

      {/* Supplier List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliersLoading ? (
          <div className="col-span-3 text-center py-8">Loading suppliers...</div>
        ) : (
          suppliers?.map((supplier) => (
            <Card 
              key={supplier.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedSupplierId === supplier.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedSupplierId(supplier.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{supplier.businessName}</CardTitle>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{supplier.businessType}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{supplier.googleRating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Listings:</span>
                    <span className="font-medium">{supplier.totalListings}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className="font-medium">
                      {supplier.totalListings > 0 
                        ? Math.round((supplier.successfulDeliveries / supplier.totalListings) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Safety Rating:</span>
                    <span className={`font-bold ${getSafetyColor(supplier.safetyRating)}`}>
                      {supplier.safetyRating}/5.0
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* AI Analysis Results */}
      {selectedSupplierId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              AI Safety Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Analyzing supplier safety...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 text-primary">
                    {analysis.safetyRating}/5.0
                  </div>
                  <Badge {...getSafetyBadge(analysis.safetyRating)}>
                    {getSafetyBadge(analysis.safetyRating).text}
                  </Badge>
                  <Progress value={analysis.safetyRating * 20} className="mt-4" />
                </div>

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Verification Status */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">License Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {analysis.verification.licenseValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">
                            {analysis.verification.licenseValid ? "Valid" : "Expired/Invalid"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          License: {analysis.verification.licenseNumber || "Not provided"}
                        </div>
                        <Badge 
                          variant={analysis.verification.verificationStatus === "verified" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {analysis.verification.verificationStatus}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Performance History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Listings:</span>
                          <span className="font-medium">{analysis.performance.totalListings}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Successful:</span>
                          <span className="font-medium">{analysis.performance.successfulDeliveries}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Success Rate:</span>
                          <span className="font-medium text-green-600">
                            {Math.round(analysis.performance.successRate * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reputation */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Online Reputation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            Google: {analysis.reputation.googleRating || "Not available"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            {analysis.reputation.accountAge} days active
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Factors */}
                {analysis.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Risk Factors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.riskFactors.map((risk, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-2">AI Recommendations</h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Demo Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Hackathon Demo Features</h4>
              <p className="text-sm text-blue-700 mb-3">
                The AI analyzer automatically checks supplier safety based on:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>License validity</strong> - Food safety license expiration dates</li>
                <li>• <strong>Google Reviews</strong> - Real business reputation data</li>
                <li>• <strong>Delivery history</strong> - Success rate and reliability</li>
                <li>• <strong>Account age</strong> - How long they've been on the platform</li>
                <li>• <strong>Verification status</strong> - Manual verification by admin</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}