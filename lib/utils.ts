import type { ClaimData, ClaimStatus } from "./types"

// Generate a random 12-digit claim ID
export function generateClaimId(): string {
  const digits = "0123456789"
  let id = ""

  // Generate 12 random digits
  for (let i = 0; i < 12; i++) {
    id += digits.charAt(Math.floor(Math.random() * digits.length))
  }

  return id
}

// Save claim data to local storage
export async function saveClaimToStorage(claim: ClaimData): Promise<void> {
  // Save to local storage
  const claims = getClaimsFromStorage()
  claims.push(claim)
  localStorage.setItem("insuranceClaims", JSON.stringify(claims))

  // Save to database
  try {
    const response = await fetch('/api/claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(claim)
    })

    if (!response.ok) {
      throw new Error('Failed to save claim to database')
    }
  } catch (error) {
    console.error('Error saving claim to database:', error)
    throw error
  }
}

// Get all claims from local storage
export function getClaimsFromStorage(): ClaimData[] {
  if (typeof window === "undefined") return []

  const storedClaims = localStorage.getItem("insuranceClaims")
  return storedClaims ? JSON.parse(storedClaims) : []
}

// Get a specific claim by ID
export function getClaimById(id: string): ClaimData | null {
  const claims = getClaimsFromStorage()
  return claims.find((claim) => claim.id === id) || null
}

// Update claim status
export async function updateClaimStatus(id: string, newStatus: ClaimStatus): Promise<ClaimData | null> {
  const claims = getClaimsFromStorage()
  const claimIndex = claims.findIndex((claim) => claim.id === id)

  if (claimIndex === -1) return null

  claims[claimIndex].status = newStatus
  localStorage.setItem("insuranceClaims", JSON.stringify(claims))

  // Update database
  try {
    const response = await fetch(`/api/claims/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus })
    })

    if (!response.ok) {
      throw new Error('Failed to update claim status in database')
    }
  } catch (error) {
    console.error('Error updating claim status in database:', error)
    throw error
  }

  return claims[claimIndex]
}

// Delete a claim
export function deleteClaim(id: string): boolean {
  const claims = getClaimsFromStorage()
  const filteredClaims = claims.filter((claim) => claim.id !== id)

  if (filteredClaims.length === claims.length) return false

  localStorage.setItem("insuranceClaims", JSON.stringify(filteredClaims))
  return true
}

export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(" ")
}
