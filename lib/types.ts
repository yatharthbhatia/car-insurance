export interface DamageAssessment {
  severity: string
  estimatedCost: number
  repairTime: number
  notes: string
}

export type ClaimStatus = 'new' | 'in_progress' | 'approved' | 'rejected' | 'pending';

export interface ClaimData {
  id: string
  customerName: string
  email: string
  phone: string
  policyNumber: string
  incidentDate: string
  incidentType: string
  description: string
  vehicleBrand?: string
  image: string | null
  status: ClaimStatus
  createdAt: string
  damageAssessment?: DamageAssessment
  estimatedCost?: number
}
