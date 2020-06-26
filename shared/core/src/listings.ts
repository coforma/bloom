import { Unit, UnitsSummarized } from "./units"
import { Address } from "./general"
import { Preference } from "./preferences"

export enum AttachmentType {
  ApplicationDownload = 1,
  ExternalApplication = 2,
}

export interface Attachment {
  label: string
  fileUrl: string
  type: AttachmentType
}

export interface WhatToExpect {
  applicantsWillBeContacted: string
  allInfoWillBeVerified: string
  bePreparedIfChosen: string
}

export interface Listing {
  acceptingApplicationsAtLeasingAgent: boolean
  acceptingApplicationsByPoBox: boolean
  acceptingOnlineApplications: boolean
  acceptsPostmarkedApplications: boolean
  applicationPickUpAddress: Address
  applicationPickUpAddressOfficeHours: string
  accessibility: string
  amenities: string
  applicationDueDate: string
  applicationOpenDate?: string
  applicationFee: string
  applicationOrganization: string
  applicationAddress: Address
  attachments: Attachment[]
  blankPaperApplicationCanBePickedUp: boolean
  buildingAddress: Address
  buildingTotalUnits: number
  buildingSelectionCriteria: string
  costsNotIncluded: string
  creditHistory: string
  criminalBackground: string
  depositMin: string
  depositMax?: string
  depositMaxExtraText?: string
  developer: string
  disableUnitsAccordion?: boolean
  id: string
  imageUrl?: string
  leasingAgentAddress: Address
  leasingAgentEmail: string
  leasingAgentName: string
  leasingAgentOfficeHours: string
  leasingAgentPhone: string
  leasingAgentTitle: string
  name: string
  neighborhood: string
  preferences: Preference[]
  petPolicy: string
  postmarkedApplicationsReceivedByDate: string
  programRules?: string
  rentalHistory: string
  requiredDocuments: string
  smokingPolicy: string
  units: Unit[]
  unitsAvailable: number
  unitAmenities: string
  unitsSummarized?: UnitsSummarized
  urlSlug?: string
  waitlistCurrentSize: number
  waitlistMaxSize: number
  whatToExpect?: WhatToExpect
  yearBuilt: number
}
