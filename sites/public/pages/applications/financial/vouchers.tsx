/*
3.1 Vouchers Subsidies
Question asks if anyone on the application receives a housing voucher or subsidy.
*/
import {
  AppearanceStyleType,
  AlertBox,
  Button,
  Form,
  FormCard,
  t,
  ProgressNav,
  FieldGroup,
  AuthContext,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import FormBackLink from "../../../src/forms/applications/FormBackLink"
import { useFormConductor } from "../../../lib/hooks"
import { OnClientSide, PageView, pushGtmEvent } from "@bloom-housing/shared-helpers"
import { useContext, useEffect } from "react"
import { UserStatus } from "../../../lib/constants"

const ApplicationVouchers = () => {
  const { profile } = useContext(AuthContext)
  const { conductor, application, listing } = useFormConductor("vouchersSubsidies")
  const currentPageSection = 3

  /* Form Handler */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors } = useForm({
    defaultValues: { incomeVouchers: application.incomeVouchers?.toString() },
    shouldFocusError: false,
  })

  const onSubmit = (data) => {
    const { incomeVouchers } = data
    const toSave = { incomeVouchers: JSON.parse(incomeVouchers) }

    conductor.currentStep.save(toSave)
    conductor.routeToNextOrReturnUrl()
  }
  const onError = () => {
    window.scrollTo(0, 0)
  }

  const incomeVouchersValues = [
    {
      id: "incomeVouchersYes",
      value: "true",
      label: t("t.yes"),
    },
    {
      id: "incomeVouchersNo",
      value: "false",
      label: t("t.no"),
    },
  ]

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Vouchers Subsidies",
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
            {t("application.financial.vouchers.title")}
          </h2>

          <p className="field-note mb-4 mt-5">
            <strong>{t("application.financial.vouchers.housingVouchers.strong")}</strong>
            {` ${t("application.financial.vouchers.housingVouchers.text")}`}
          </p>

          <p className="field-note mb-4">
            <strong>{t("application.financial.vouchers.nonTaxableIncome.strong")}</strong>
            {` ${t("application.financial.vouchers.nonTaxableIncome.text")}`}
          </p>

          <p className="field-note">
            <strong>{t("application.financial.vouchers.rentalSubsidies.strong")}</strong>
            {` ${t("application.financial.vouchers.rentalSubsidies.text")}`}
          </p>
        </div>

        {Object.entries(errors).length > 0 && (
          <AlertBox type="alert" inverted closeable>
            {t("errors.errorsToResolve")}
          </AlertBox>
        )}

        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className={`form-card__group field text-lg ${errors.incomeVouchers ? "error" : ""}`}>
            <fieldset>
              <legend className="sr-only">{t("application.financial.vouchers.legend")}</legend>
              <p className="field-note mb-4">{t("t.pleaseSelectYesNo")}</p>
              <FieldGroup
                type="radio"
                name="incomeVouchers"
                error={errors.incomeVouchers}
                errorMessage={t("errors.selectAnOption")}
                register={register}
                validation={{ required: true }}
                fields={incomeVouchersValues}
                dataTestId={"app-income-vouchers"}
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

export default ApplicationVouchers
