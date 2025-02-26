/*
0.1 - Choose Language
Applicants are given the option to start the Application in one of a number of languages via button group. Once inside the application the applicant can use the language selection at the top of the page.
https://github.com/bloom-housing/bloom/issues/277
*/
import axios from "axios"
import { useRouter } from "next/router"
import {
  Button,
  ImageCard,
  LinkButton,
  FormCard,
  AuthContext,
  ProgressNav,
  t,
} from "@bloom-housing/ui-components"
import {
  imageUrlFromListing,
  OnClientSide,
  PageView,
  pushGtmEvent,
} from "@bloom-housing/shared-helpers"

import FormsLayout from "../../../layouts/forms"
import { AppSubmissionContext, retrieveApplicationConfig } from "../../../lib/AppSubmissionContext"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { Language } from "@bloom-housing/backend-core/types"
import { useGetApplicationStatusProps } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"

const loadListing = async (listingId, stateFunction, conductor, context, language) => {
  const response = await axios.get(`${process.env.backendApiBase}/listings/${listingId}`, {
    headers: { language },
  })
  conductor.listing = response.data
  const applicationConfig = retrieveApplicationConfig(conductor.listing) // TODO: load from backend
  conductor.config = applicationConfig
  stateFunction(conductor.listing)
  context.syncListing(conductor.listing)
}

const ApplicationChooseLanguage = () => {
  const router = useRouter()
  const [listing, setListing] = useState(null)
  const context = useContext(AppSubmissionContext)
  const { initialStateLoaded, profile } = useContext(AuthContext)
  const { conductor, application } = context

  const listingId = router.query.listingId

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Choose Language",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  useEffect(() => {
    conductor.reset()
    if (!router.isReady && !listingId) return
    if (router.isReady && !listingId) {
      void router.push("/")
      return
    }

    if (!context.listing || context.listing.id !== listingId) {
      void loadListing(listingId, setListing, conductor, context, "en")
    } else {
      conductor.listing = context.listing
      setListing(context.listing)
    }
  }, [router, conductor, context, listingId])

  const currentPageSection = 1

  const imageUrl = listing?.assets
    ? imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize))
    : ""

  const onLanguageSelect = useCallback(
    (language: Language) => {
      conductor.currentStep.save({
        language,
      })
      void loadListing(listingId, setListing, conductor, context, language).then(() => {
        const newLocale = language == "en" ? "" : `/${language}`
        void router.push(`${newLocale}${conductor.determineNextUrl()}`).then(() => {
          window.scrollTo(0, 0)
        })
      })
    },
    [conductor, context, listingId, router]
  )

  const { content: appStatusContent } = useGetApplicationStatusProps(listing)

  return (
    <FormsLayout>
      <FormCard header={listing?.name}>
        <ProgressNav
          currentPageSection={currentPageSection}
          completedSections={application.completedSections}
          labels={
            listing?.applicationConfig.sections || [
              "You",
              "Household",
              "Income",
              "Preferences",
              "Review",
            ]
          }
          mounted={OnClientSide()}
        />
      </FormCard>
      <FormCard className="overflow-hidden">
        <div className="form-card__lead">
          <h2 className="form-card__title is-borderless">
            {t("application.chooseLanguage.letsGetStarted")}
          </h2>
        </div>

        {listing && (
          <div className="form-card__group p-0 m-0">
            <ImageCard
              title={listing.name}
              imageUrl={imageUrl}
              statuses={[{ content: appStatusContent }]}
            />
          </div>
        )}

        <div className="form-card__pager">
          <div className="form-card__pager-row primary px-4">
            {listing?.applicationConfig.languages.length > 1 && (
              <>
                <h3 className="mb-4 font-alt-sans field-label--caps block text-base text-black">
                  {t("application.chooseLanguage.chooseYourLanguage")}
                </h3>

                {listing.applicationConfig.languages.map((lang, index) => (
                  <Button
                    className="language-select mx-1"
                    onClick={() => {
                      onLanguageSelect(lang)
                    }}
                    key={index}
                    data-test-id={"app-choose-language-button"}
                  >
                    {t(`applications.begin.${lang}`)}
                  </Button>
                ))}
              </>
            )}
          </div>

          {initialStateLoaded && !profile && (
            <div className="form-card__pager-row primary px-4 border-t border-gray-450">
              <h2 className="form-card__title w-full border-none pt-0 mt-0">
                {t("account.haveAnAccount")}
              </h2>

              <p className="my-6">{t("application.chooseLanguage.signInSaveTime")}</p>

              <div>
                <LinkButton
                  href={`/sign-in?redirectUrl=/applications/start/choose-language&listingId=${listingId?.toString()}`}
                  dataTestId={"app-choose-language-sign-in-button"}
                >
                  {t("nav.signIn")}
                </LinkButton>
              </div>
            </div>
          )}
        </div>
      </FormCard>
    </FormsLayout>
  )
}

export default ApplicationChooseLanguage
