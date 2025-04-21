import { NextRequest, NextResponse } from "next/server"
import { dbPool } from "@/lib/db/config"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params);
    console.log("Received claim ID:", id); // Debug the input ID
    const { searchParams } = new URL(request.url)
    const sendEmail = searchParams.get("send_email") === "true"

    // Get claim data from database
    const [rows] = await dbPool.execute(
      'SELECT * FROM claims WHERE claim_id = ?',
      [id]
    );
    const claim = (rows as any[])[0];
    console.log("Claim details:", JSON.stringify(claim, null, 2));
    
    if (!claim) {
      console.error(`No claim found for ID: ${id}`);
      return NextResponse.json(
        { error: `Claim not found for ID: ${id}` }, 
        { status: 404 }
      )
    }

    // Verify claim structure
    if (!claim.email) {
      console.error("Claim missing email field:", claim);
      return NextResponse.json(
        { error: "Claim data is incomplete" },
        { status: 400 }
      )
    }

    // Make request to report generation service
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(`${process.env.REPORT_GENERATION_API_URL}/generate-report?send_email=` + sendEmail, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claim_id: id,
          email: claim.email,
          customer_name: claim.customer_name,
          policy_number: claim.policy_number,
          incident_date: claim.incident_date,
          vehicle_brand: claim.vehicle_brand,
          damage_photo_url: claim.damage_photo_url
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        console.error('Report generation service error:', errorData)
        throw new Error(`Report generation service error: ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      clearTimeout(timeoutId) // Clear the timeout after successful response
      console.log("Report generation response:", result)
      
      // Validate report generation result
      if (!result.message || !result.message.includes('PDF uploaded to S3')) {
        console.error('Invalid report generation response:', result)
        throw new Error('Invalid response from report generation service')
      }

      // Extract report URL from S3 bucket path
      const reportUrl = `https://${process.env.S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/claims/${id}/report.pdf`

      // Update claim with report URL
      try {
        console.log("Updating claim with report URL:", reportUrl)
        const [updateResult] = await dbPool.execute(
          'UPDATE claims SET report_url = ? WHERE claim_id = ?',
          [reportUrl, id]
        );
        console.log("Database update result:", updateResult)
      } catch (dbError) {
        console.error("Failed to update claim with report URL:", dbError)
        throw new Error('Failed to update claim with report URL')
      }
      
      return NextResponse.json({
        success: true,
        report_url: reportUrl,
        message: 'Report generated successfully'
      })
      
    } catch (error) {
      clearTimeout(timeoutId) // Clear the timeout in case of error
      console.error("Error generating report:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate report"
      const isTimeout = error instanceof Error && error.message.includes("aborted")
      const statusCode = isTimeout ? 504 : 500
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: isTimeout ? "Report generation timed out" : "Internal server error"
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    console.error("Error in main try block:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}