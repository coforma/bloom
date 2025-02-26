import { useContext } from "react"
import useSWR, { mutate } from "swr"
import qs from "qs"

import { AuthContext } from "@bloom-housing/ui-components"
import {
  EnumApplicationsApiExtraModelOrder,
  EnumApplicationsApiExtraModelOrderBy,
  EnumListingFilterParamsComparison,
  EnumPreferencesFilterParamsComparison,
  EnumProgramsFilterParamsComparison,
  EnumUserFilterParamsComparison,
} from "@bloom-housing/backend-core/types"

interface PaginationProps {
  page?: number
  limit: number | "all"
}

interface UseSingleApplicationDataProps extends PaginationProps {
  listingId: string
}

type UseUserListProps = PaginationProps

type UseListingsDataProps = PaginationProps & {
  userId?: string
}

export function useSingleListingData(listingId: string) {
  const { listingsService } = useContext(AuthContext)
  const fetcher = () => listingsService.retrieve({ id: listingId })

  const { data, error } = useSWR(`${process.env.backendApiBase}/listings/${listingId}`, fetcher)

  return {
    listingDto: data,
    listingLoading: !error && !data,
    listingError: error,
  }
}

export function useListingsData({ page, limit, userId }: UseListingsDataProps) {
  const params = {
    page,
    limit,
  }

  // filter if logged user is an agent
  if (typeof userId !== undefined) {
    Object.assign(params, {
      filter: [
        {
          $comparison: EnumListingFilterParamsComparison["="],
          leasingAgents: userId,
        },
      ],
      view: "base",
    })
  }

  const { listingsService } = useContext(AuthContext)
  const fetcher = () => listingsService.list(params)

  const paramsString = qs.stringify(params)
  const { data, error } = useSWR(`${process.env.backendApiBase}/listings?${paramsString}`, fetcher)

  return {
    listingDtos: data,
    listingsLoading: !error && !data,
    listingsError: error,
  }
}

export function useApplicationsData(
  pageIndex: number,
  limit = 10,
  listingId: string,
  search: string,
  orderBy?: EnumApplicationsApiExtraModelOrderBy,
  order?: EnumApplicationsApiExtraModelOrder
) {
  const { applicationsService } = useContext(AuthContext)

  const queryParams = new URLSearchParams()
  queryParams.append("listingId", listingId)
  queryParams.append("page", pageIndex.toString())
  queryParams.append("limit", limit.toString())

  if (search) {
    queryParams.append("search", search)
  }

  if (orderBy) {
    queryParams.append("orderBy", search)
    queryParams.append("order", order ?? EnumApplicationsApiExtraModelOrder.ASC)
  }

  const endpoint = `${process.env.backendApiBase}/applications?${queryParams.toString()}`

  const params = {
    listingId,
    page: pageIndex,
    limit,
  }

  if (search) {
    Object.assign(params, { search })
  }

  if (orderBy) {
    Object.assign(params, { orderBy, order: order ?? "ASC" })
  }

  const fetcher = () => applicationsService.list(params)
  const { data, error } = useSWR(endpoint, fetcher)

  return {
    appsData: data,
    appsLoading: !error && !data,
    appsError: error,
  }
}

export function useSingleApplicationData(applicationId: string) {
  const { applicationsService } = useContext(AuthContext)
  const backendSingleApplicationsEndpointUrl = `${process.env.backendApiBase}/applications/${applicationId}`

  const fetcher = () => applicationsService.retrieve({ id: applicationId })
  const { data, error } = useSWR(backendSingleApplicationsEndpointUrl, fetcher)

  return {
    application: data,
    applicationLoading: !error && !data,
    applicationError: error,
  }
}

export function useFlaggedApplicationsList({
  listingId,
  page,
  limit,
}: UseSingleApplicationDataProps) {
  const { applicationFlaggedSetsService } = useContext(AuthContext)

  const params = {
    listingId,
    page,
  }

  const queryParams = new URLSearchParams()
  queryParams.append("listingId", listingId)
  queryParams.append("page", page.toString())

  if (typeof limit === "number") {
    queryParams.append("limit", limit.toString())
    Object.assign(params, limit)
  }

  const endpoint = `${process.env.backendApiBase}/applicationFlaggedSets?${queryParams.toString()}`

  const fetcher = () => applicationFlaggedSetsService.list(params)

  const { data, error } = useSWR(endpoint, fetcher)

  return {
    data,
    error,
  }
}

export function useSingleFlaggedApplication(afsId: string) {
  const { applicationFlaggedSetsService } = useContext(AuthContext)

  const endpoint = `${process.env.backendApiBase}/applicationFlaggedSets/${afsId}`
  const fetcher = () =>
    applicationFlaggedSetsService.retrieve({
      afsId,
    })

  const { data, error } = useSWR(endpoint, fetcher)

  const revalidate = () => mutate(endpoint)

  return {
    revalidate,
    data,
    error,
  }
}

export function useSingleAmiChartData(amiChartId: string) {
  const { amiChartsService } = useContext(AuthContext)
  const fetcher = () => amiChartsService.retrieve({ amiChartId })

  const { data, error } = useSWR(`${process.env.backendApiBase}/amiCharts/${amiChartId}`, fetcher)

  return {
    data,
    error,
  }
}

export function useAmiChartList(jurisdiction: string) {
  const { amiChartsService } = useContext(AuthContext)
  const fetcher = () => amiChartsService.list({ jurisdictionId: jurisdiction })

  const { data, error } = useSWR(`${process.env.backendApiBase}/amiCharts/${jurisdiction}`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useSingleAmiChart(amiChartId: string) {
  const { amiChartsService } = useContext(AuthContext)
  const fetcher = () => amiChartsService.retrieve({ amiChartId })

  const { data, error } = useSWR(`${process.env.backendApiBase}/amiCharts/${amiChartId}`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useUnitPriorityList() {
  const { unitPriorityService } = useContext(AuthContext)
  const fetcher = () => unitPriorityService.list()

  const { data, error } = useSWR(
    `${process.env.backendApiBase}/unitAccessibilityPriorityTypes`,
    fetcher
  )

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useUnitTypeList() {
  const { unitTypesService } = useContext(AuthContext)
  const fetcher = () => unitTypesService.list()

  const { data, error } = useSWR(`${process.env.backendApiBase}/unitTypes`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function usePreferenceList() {
  const { preferencesService } = useContext(AuthContext)
  const fetcher = () => preferencesService.list()

  const { data, error } = useSWR(`${process.env.backendApiBase}/preferences`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useJurisdictionalPreferenceList(jurisdictionId: string) {
  const { preferencesService } = useContext(AuthContext)
  const fetcher = () =>
    preferencesService.list({
      filter: [
        {
          $comparison: EnumPreferencesFilterParamsComparison["="],
          jurisdiction: jurisdictionId,
        },
      ],
    })

  const { data, error } = useSWR(
    `${process.env.backendApiBase}/preferences/${jurisdictionId}`,
    fetcher
  )

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useProgramList() {
  const { programsService } = useContext(AuthContext)
  const fetcher = () => programsService.list()

  const { data, error } = useSWR(`${process.env.backendApiBase}/programs`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useJurisdictionalProgramList(jurisdictionId: string) {
  const { programsService } = useContext(AuthContext)
  const fetcher = () =>
    programsService.list({
      filter: [
        {
          $comparison: EnumProgramsFilterParamsComparison["="],
          jurisdiction: jurisdictionId,
        },
      ],
    })

  const { data, error } = useSWR(
    `${process.env.backendApiBase}/programs/${jurisdictionId}`,
    fetcher
  )

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useReservedCommunityTypeList() {
  const { reservedCommunityTypeService } = useContext(AuthContext)
  const fetcher = () => reservedCommunityTypeService.list()

  const { data, error } = useSWR(`${process.env.backendApiBase}/reservedCommunityTypes`, fetcher)

  return {
    data,
    loading: !error && !data,
    error,
  }
}

export function useUserList({ page, limit }: UseUserListProps) {
  const queryParams = new URLSearchParams()
  queryParams.append("page", page.toString())
  queryParams.append("limit", limit.toString())

  const { userService } = useContext(AuthContext)

  const fetcher = () =>
    userService.list({
      page,
      limit,
      filter: [
        {
          isPartner: true,
          $comparison: EnumUserFilterParamsComparison["="],
        },
      ],
    })

  const { data, error } = useSWR(
    `${process.env.backendApiBase}/user/list?${queryParams.toString()}`,
    fetcher
  )

  return {
    data,
    loading: !error && !data,
    error,
  }
}
