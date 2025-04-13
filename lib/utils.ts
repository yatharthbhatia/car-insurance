import type { ClaimData } from "./types"

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
export function saveClaimToStorage(claim: ClaimData): void {
  const claims = getClaimsFromStorage()
  claims.push(claim)
  localStorage.setItem("insuranceClaims", JSON.stringify(claims))
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
export function updateClaimStatus(id: string, newStatus: string): ClaimData | null {
  const claims = getClaimsFromStorage()
  const claimIndex = claims.findIndex((claim) => claim.id === id)

  if (claimIndex === -1) return null

  claims[claimIndex].status = newStatus
  localStorage.setItem("insuranceClaims", JSON.stringify(claims))

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
