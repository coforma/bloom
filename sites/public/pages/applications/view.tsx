/*
5.5 View
Optional application summary
*/
import Link from "next/link"
import dayjs from "dayjs"
import { AuthContext, FormCard, t } from "@bloom-housing/ui-components"
import FormsLayout from "../../layouts/forms"
import { AppSubmissionContext } from "../../lib/AppSubmissionContext"
import { useContext, useEffect, useMemo } from "react"
import FormSummaryDetails from "../../src/forms/applications/FormSummaryDetails"
import { DATE_FORMAT, UserStatus } from "../../lib/constants"
import { pushGtmEvent, PageView } from "@bloom-housing/shared-helpers"

const ApplicationView = () => {
  const { application, listing } = useContext(AppSubmissionContext)
  const { profile } = useContext(AuthContext)

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Optional Summary",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  const confirmationDate = useMemo(() => {
    return dayjs().format(DATE_FORMAT)
  }, [])

  return (
    <FormsLayout>
      <FormCard header="Confirmation">
        <div className="py-2">
          {listing && (
            <Link href={`/listing/${listing.id}/${listing.urlSlug}`}>
              <a className="lined text-tiny">{t("application.confirmation.viewOriginalListing")}</a>
            </Link>
          )}
        </div>
      </FormCard>

      <FormCard>
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.confirmation.informationSubmittedTitle")}
          </h2>
          <p className="field-note mt-4 text-center">
            {t("application.confirmation.submitted")}
            {confirmationDate}
          </p>
        </div>
        <div className="form-card__group text-center">
          <h3 className="form-card__paragraph-title">
            {t("application.confirmation.lotteryNumber")}
          </h3>

          <p className="font-serif text-3xl my-0">
            {application.confirmationCode || application.id}
          </p>
        </div>

        <FormSummaryDetails
          listing={listing}
          application={application}
          hidePreferences={listing?.listingPreferences.length === 0}
          editMode={false}
        />

        <div className="form-card__pager hide-for-print">
          <div className="form-card__pager-row py-6">
            <a href="#" className="lined text-tiny" onClick={() => window.print()}>
              {t("application.confirmation.printCopy")}
            </a>
          </div>
        </div>
      </FormCard>
    </FormsLayout>
  )
}

export default ApplicationView
