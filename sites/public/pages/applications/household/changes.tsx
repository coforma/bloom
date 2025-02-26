/*
2.5 Expecting Household Changes
*/
import {
  AppearanceStyleType,
  AlertBox,
  Button,
  FieldGroup,
  Form,
  FormCard,
  ProgressNav,
  t,
  AuthContext,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import FormBackLink from "../../../src/forms/applications/FormBackLink"
import { useFormConductor } from "../../../lib/hooks"
import { OnClientSide, PageView, pushGtmEvent } from "@bloom-housing/shared-helpers"
import { useContext, useEffect } from "react"
import { UserStatus } from "../../../lib/constants"

const ApplicationHouseholdChanges = () => {
  const { profile } = useContext(AuthContext)
  const { conductor, application, listing } = useFormConductor("householdChanges")
  const currentPageSection = 2

  /* Form Handler */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors } = useForm<Record<string, any>>({
    defaultValues: { householdExpectingChanges: application.householdExpectingChanges?.toString() },
    shouldFocusError: false,
  })
  const onSubmit = (data) => {
    const { householdExpectingChanges } = data
    conductor.currentStep.save({
      householdExpectingChanges: householdExpectingChanges === "true",
    })
    conductor.sync()
    conductor.routeToNextOrReturnUrl()
  }

  const onError = () => {
    window.scrollTo(0, 0)
  }

  const householdChangesValues = [
    {
      id: "householdChangesYes",
      value: "true",
      label: t("t.yes"),
    },
    {
      id: "householdChangesNo",
      value: "false",
      label: t("t.no"),
    },
  ]

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Expecting Household Changes",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <FormsLayout>
      <FormCard header={listing?.name}>
        <ProgressNav
          currentPageSection={currentPageSection}
          completedSections={application.completedSections}
          labels={conductor.config.sections.map((label) => t(`t.${label}`))}
          mounted={OnClientSide()}
        />
      </FormCard>
      <FormCard>
        <FormBackLink
          url={conductor.determinePreviousUrl()}
          onClick={() => conductor.setNavigatedBack(true)}
        />

        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.household.expectingChanges.question")}
          </h2>

          <p className="field-note mt-5">{t("application.household.genericSubtitle")}</p>
        </div>

        {Object.entries(errors).length > 0 && (
          <AlertBox type="alert" inverted closeable>
            {t("errors.errorsToResolve")}
          </AlertBox>
        )}

        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <div
            className={`form-card__group field text-lg ${
              errors.expectingHouseholdChanges ? "error" : ""
            }`}
          >
            <fieldset>
              <p className="field-note mb-4">{t("t.pleaseSelectYesNo")}</p>
              <FieldGroup
                type="radio"
                name="householdExpectingChanges"
                error={errors.householdExpectingChanges}
                errorMessage={t("errors.selectAnOption")}
                register={register}
                validation={{ required: true }}
                fields={householdChangesValues}
                dataTestId={"app-expecting-changes"}
              />
            </fieldset>
          </div>

          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                styleType={AppearanceStyleType.primary}
                onClick={() => conductor.setNavigatedBack(false)}
                data-test-id={"app-next-step-button"}
              >
                {t("t.next")}
              </Button>
            </div>
          </div>
        </Form>
      </FormCard>
    </FormsLayout>
  )
}

export default ApplicationHouseholdChanges
