"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, User, Calendar, ImageIcon, CheckCircle2, ArrowRight } from "lucide-react"
import { generateClaimId, saveClaimToStorage } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("customer")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    policyNumber: "",
    incidentDate: "",
    incidentType: "",
    description: "",
    vehicleBrand: "", // Add this new field
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, incidentType: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate a unique 12-digit claim ID
      const claimId = generateClaimId()

      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate AI damage assessment
      const damageAssessment = {
        severity: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)],
        estimatedCost: Math.floor(Math.random() * 10000) + 500,
        repairTime: Math.floor(Math.random() * 30) + 1,
        notes: "AI-generated assessment based on uploaded image.",
      }

      // Save the claim data
      const claimData = {
        id: claimId,
        ...formData,
        image: uploadedImage,
        status: "New",
        createdAt: new Date().toISOString(),
        damageAssessment,
      }

      saveClaimToStorage(claimData)

      // Navigate to the claim details page
      router.push(`/claims/${claimId}`)
    } catch (error) {
      console.error("Error submitting claim:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "customer") setActiveTab("incident")
    else if (activeTab === "incident") setActiveTab("evidence")
    else if (activeTab === "evidence") setActiveTab("review")
    else if (activeTab === "review") setActiveTab("review")
  }

  const prevTab = () => {
    if (activeTab === "incident") setActiveTab("customer")
    else if (activeTab === "evidence") setActiveTab("incident")
    else if (activeTab === "review") setActiveTab("evidence")
  }

  const isTabComplete = (tab: string) => {
    switch (tab) {
      case "customer":
        return formData.customerName && formData.email && formData.phone && formData.policyNumber
      case "incident":
        if (formData.incidentType === "vehicle") {
          return formData.incidentDate && formData.incidentType && formData.description && formData.vehicleBrand
        }
        return formData.incidentDate && formData.incidentType && formData.description
      case "evidence":
        return true // Optional
      default:
        return false
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Register New Insurance Claim</CardTitle>
          <CardDescription>Complete all required information to submit a new claim</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Customer</span>
                </TabsTrigger>
                <TabsTrigger value="incident" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Incident</span>
                </TabsTrigger>
                <TabsTrigger value="evidence" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Evidence</span>
                </TabsTrigger>
                <TabsTrigger value="review" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Review</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-6">
              <TabsContent value="customer" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Customer Information</h3>
                  <p className="text-sm text-muted-foreground">Enter the policyholder's personal details</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      placeholder="John Doe"
                      required
                      value={formData.customerName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      name="policyNumber"
                      placeholder="POL-12345678"
                      required
                      value={formData.policyNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+1 (555) 123-4567"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="incident" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Incident Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide information about when and how the incident occurred
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="incidentDate">Incident Date</Label>
                    <Input
                      id="incidentDate"
                      name="incidentDate"
                      type="date"
                      required
                      value={formData.incidentDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incidentType">Incident Type</Label>
                    <Select onValueChange={handleSelectChange} value={formData.incidentType}>
                      <SelectTrigger id="incidentType">
                        <SelectValue placeholder="Select incident type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vehicle">Vehicle Accident</SelectItem>
                        <SelectItem value="property">Property Damage</SelectItem>
                        <SelectItem value="theft">Theft</SelectItem>
                        <SelectItem value="fire">Fire Damage</SelectItem>
                        <SelectItem value="water">Water Damage</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
                    <Input
                      id="vehicleBrand"
                      name="vehicleBrand"
                      placeholder="e.g. Toyota, Honda, BMW"
                      value={formData.vehicleBrand}
                      onChange={handleInputChange}
                      disabled={formData.incidentType !== "vehicle"}
                    />
                    <p className="text-xs text-muted-foreground">Required for vehicle incidents only</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Incident Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Please provide details about the incident..."
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Damage Evidence</h3>
                  <p className="text-sm text-muted-foreground">Upload photos of the damage for AI assessment</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="damagePhoto">Upload Photo of Damage</Label>
                  <div className="border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center">
                    {uploadedImage ? (
                      <div className="space-y-4 w-full">
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Uploaded damage"
                          className="max-h-64 mx-auto object-contain rounded-md"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setUploadedImage(null)}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          Drag and drop an image, or click to browse
                        </p>
                        <Input
                          id="damagePhoto"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("damagePhoto")?.click()}
                        >
                          Select Image
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Our AI will analyze the image to assess damage and estimate repair costs.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-6 mt-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Review Claim Information</h3>
                  <p className="text-sm text-muted-foreground">Verify all details before submitting your claim</p>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {formData.customerName || "Not provided"}
                      </div>
                      <div>
                        <span className="font-medium">Policy Number:</span> {formData.policyNumber || "Not provided"}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {formData.email || "Not provided"}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {formData.phone || "Not provided"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Incident Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                      <div>
                        <span className="font-medium">Date:</span> {formData.incidentDate || "Not provided"}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {formData.incidentType
                          ? formData.incidentType.charAt(0).toUpperCase() + formData.incidentType.slice(1)
                          : "Not provided"}
                      </div>
                      {formData.incidentType === "vehicle" && (
                        <div>
                          <span className="font-medium">Vehicle Brand:</span> {formData.vehicleBrand || "Not provided"}
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1">{formData.description || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Evidence</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      {uploadedImage ? (
                        <div className="flex items-center">
                          <img
                            src={uploadedImage || "/placeholder.svg"}
                            alt="Damage evidence"
                            className="h-16 w-16 object-cover rounded-md mr-4"
                          />
                          <span>Image uploaded successfully</span>
                        </div>
                      ) : (
                        <span>No image uploaded</span>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </CardContent>

            <CardFooter className="flex justify-between px-6 pb-6">
              {activeTab !== "customer" ? (
                <Button type="button" variant="outline" onClick={prevTab}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => router.push("/")}>
                  Cancel
                </Button>
              )}

              {activeTab !== "review" ? (
                <Button type="button" onClick={nextTab} disabled={!isTabComplete(activeTab)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Claim"
                  )}
                </Button>
              )}
            </CardFooter>
          </Tabs>
        </form>
      </Card>
    </div>
  )
}
