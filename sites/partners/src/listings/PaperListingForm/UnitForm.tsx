import React, { useEffect, useState, useContext } from "react"
import {
  t,
  GridSection,
  ViewItem,
  GridCell,
  Field,
  Select,
  AppearanceStyleType,
  AppearanceBorderType,
  FieldGroup,
  Button,
  Form,
  numberOptions,
  AuthContext,
} from "@bloom-housing/ui-components"
import { useForm, useWatch, useFormContext } from "react-hook-form"
import { TempUnit } from "./formTypes"
import {
  AmiChart,
  AmiChartItem,
  UnitAccessibilityPriorityType,
  UnitStatus,
  UnitType,
} from "@bloom-housing/backend-core/types"
import { useAmiChartList, useUnitPriorityList, useUnitTypeList } from "../../../lib/hooks"
import { arrayToFormOptions, getRentType, fieldHasError } from "../../../lib/helpers"

type UnitFormProps = {
  onSubmit: (unit: TempUnit) => void
  onClose: (openNextUnit: boolean, openCurrentUnit: boolean, defaultUnit: TempUnit) => void
  defaultUnit: TempUnit | undefined
  nextId: number
  draft: boolean
}

const UnitForm = ({ onSubmit, onClose, defaultUnit, nextId, draft }: UnitFormProps) => {
  const { amiChartsService } = useContext(AuthContext)

  const [options, setOptions] = useState({
    amiCharts: [],
    unitPriorities: [],
    unitTypes: [],
  })
  const [loading, setLoading] = useState(true)
  const [currentAmiChart, setCurrentAmiChart] = useState(null)
  const [amiChartPercentageOptions, setAmiChartPercentageOptions] = useState([])

  const unitStatusOptions = Object.values(UnitStatus).map((status) => ({
    label: t(`listings.unit.statusOptions.${status}`),
    value: status,
  }))

  const formMethods = useFormContext()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { watch } = formMethods
  const jurisdiction: string = watch("jurisdiction.id")
  /**
   * fetch form options
   */
  const { data: amiCharts = [] } = useAmiChartList(jurisdiction)
  const { data: unitPriorities = [] } = useUnitPriorityList()
  const { data: unitTypes = [] } = useUnitTypeList()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors, trigger, getValues, setValue, control, reset } = useForm()

  const rentType: string = useWatch({
    control,
    name: "rentType",
  })
  const amiPercentage: string = useWatch({
    control,
    name: "amiPercentage",
  })
  const amiChartID: string = useWatch({
    control,
    name: "amiChart.id",
  })

  const maxAmiHouseholdSize = 8

  const getAmiChartTableData = () => {
    return [...Array(maxAmiHouseholdSize)].map((_, index) => {
      const fieldName = `maxIncomeHouseholdSize${index + 1}`
      const incomeCell = (
        <Field
          key={fieldName}
          id={fieldName}
          name={fieldName}
          label={t("t.minimumIncome")}
          register={register}
          type="number"
          prepend="$"
          readerOnly
        />
      )
      return (
        <tr key={index}>
          <td className={"pl-4"}>{index + 1}</td>
          <td>{incomeCell}</td>
        </tr>
      )
    })
  }

  const resetDefaultValues = async () => {
    if (defaultUnit) {
      if (defaultUnit.amiChart) {
        const chartData = await fetchAmiChart(defaultUnit.amiChart.id)
        resetAmiTableValues(chartData, defaultUnit.amiPercentage)
      }
      Object.keys(defaultUnit).forEach((key) => {
        setValue(key, defaultUnit[key])
      })
      if (defaultUnit.amiChartOverride) {
        defaultUnit.amiChartOverride.items.forEach((override) => {
          setValue(`maxIncomeHouseholdSize${override.householdSize}`, override.income)
        })
      }
      setValue("amiPercentage", parseInt(defaultUnit["amiPercentage"]))
      setValue("rentType", getRentType(defaultUnit))
    }
    setValue("status", "available")
    setLoading(false)
  }

  useEffect(() => {
    void resetDefaultValues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAmiChart = async (defaultChartID?: string) => {
    try {
      const thisAmiChart = await amiChartsService.retrieve({
        amiChartId: defaultChartID ?? amiChartID,
      })
      const amiChartData = thisAmiChart.items
      setCurrentAmiChart(amiChartData)
      const uniquePercentages = Array.from(
        new Set(amiChartData.map((item: AmiChartItem) => item.percentOfAmi))
      ).sort(function (a: number, b: number) {
        return a - b
      })
      setAmiChartPercentageOptions(
        uniquePercentages.map((percentage) => {
          return {
            label: percentage.toString(),
            value: percentage,
          }
        })
      )
      return amiChartData
    } catch (e) {
      console.error(e)
    }
  }

  const resetAmiTableValues = (defaultAmiChart?: AmiChartItem[], defaultAmiPercentage?: string) => {
    const chart = defaultAmiChart ?? currentAmiChart
    const percentage = defaultAmiPercentage ?? amiPercentage
    const newPercentagesByHouseHold = chart.reduce((acc, item: AmiChartItem) => {
      if (item.percentOfAmi === parseInt(percentage)) {
        acc[item.householdSize] = item
      }
      return acc
    }, {})

    for (let i = 1; i < 9; i++) {
      setValue(
        `maxIncomeHouseholdSize${i}`,
        newPercentagesByHouseHold[i] ? newPercentagesByHouseHold[i].income.toString() : ""
      )
    }
  }

  useEffect(() => {
    if (amiPercentage && !loading && options) {
      resetAmiTableValues()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amiPercentage])

  type FormSubmitAction = "saveNew" | "saveExit" | "save"

  const formatFormData = (data: { [x: string]: any }) => {
    if (data.amiChart?.id) {
      const chart = amiCharts.find((chart) => chart.id === data.amiChart.id)
      data.amiChart = chart
    } else {
      delete data.amiChart
    }

    if (data.rentType === "fixed") {
      delete data.monthlyRentAsPercentOfIncome
    } else if (data.rentType === "percentage") {
      data.monthlyIncomeMin = "0"
      delete data.monthlyRent
    }

    if (data.priorityType?.id) {
      const priority = unitPriorities.find((priority) => priority.id === data.priorityType.id)
      data.priorityType = priority
    } else {
      delete data.priorityType
    }

    if (data.unitType?.id) {
      const type = unitTypes.find((type) => type.id === data.unitType.id)
      data.unitType = type
    } else {
      delete data.unitType
    }

    if (currentAmiChart) {
      // Only keep overrides so we're not duplicating existing ami data
      ;[...Array(maxAmiHouseholdSize)].forEach((_, index) => {
        const existingChartValue = currentAmiChart.filter(
          (item: AmiChartItem) =>
            item.householdSize === index + 1 && item.percentOfAmi === parseInt(amiPercentage)
        )[0]

        if (
          data[`maxIncomeHouseholdSize${index + 1}`] &&
          existingChartValue &&
          parseInt(data[`maxIncomeHouseholdSize${index + 1}`]) === existingChartValue.income
        ) {
          delete data[`maxIncomeHouseholdSize${index + 1}`]
        }
      })
    }

    const formData = {
      createdAt: undefined,
      updatedAt: undefined,
      status: UnitStatus.available,
      id: null,
      ...data,
    }

    return formData
  }

  const copyAndNew = () => {
    const data = getValues()
    const formData = formatFormData(data)
    onClose(true, false, formData)
    void resetDefaultValues()
  }

  async function onFormSubmit(action?: FormSubmitAction) {
    setLoading(true)
    const data = getValues()
    const validation = await trigger()
    if (!validation) return

    const formData = formatFormData(data)

    // If we're looking at a draft unit in the drawer
    // Save --> creates a new unit, drawer stays open on that unit
    // Save and New --> creates a new unit, opens a draft empty drawer
    // Save & Exit --> creates a new unit, closes the drawer
    // If we're looking at a saved unit
    // Make a Copy --> does not create a new unit, opens a draft drawer with same data
    // Save & New --> does not create a new unit, submits changes with existing ID, opens a draft empty drawer
    // Save & Exit --> does not create a new unit, submits changes with existing ID, closes the drawer

    if (action === "saveNew") {
      onSubmit({
        ...formData,
        tempId: draft ? nextId : defaultUnit.tempId,
      })
      onClose(true, false, null)
      reset()
      setValue("status", "available")
      setLoading(false)
    }
    if (action === "saveExit") {
      onSubmit({
        ...formData,
        tempId: draft ? nextId : defaultUnit.tempId,
      })
      onClose(false, false, null)
    }
    if (action === "save") {
      onSubmit({
        ...formData,
        tempId: nextId,
      })
      onClose(false, true, {
        ...formData,
        tempId: nextId,
      })
    }
  }

  const rentTypeOptions = [
    {
      id: "fixed",
      label: t("listings.unit.fixed"),
      value: "fixed",
    },
    {
      id: "percentage",
      label: t("listings.unit.percentage"),
      value: "percentage",
    },
  ]

  useEffect(() => {
    setOptions({
      amiCharts: arrayToFormOptions<AmiChart>(amiCharts, "name", "id"),
      unitPriorities: arrayToFormOptions<UnitAccessibilityPriorityType>(
        unitPriorities,
        "name",
        "id"
      ),
      unitTypes: arrayToFormOptions<UnitType>(unitTypes, "name", "id", "listings.unit.typeOptions"),
    })
  }, [amiCharts, unitPriorities, unitTypes])

  useEffect(() => {
    if (defaultUnit) {
      setValue("amiChart.id", defaultUnit.amiChart?.id)
      setValue("priorityType.id", defaultUnit.priorityType?.id)
      setValue("unitType.id", defaultUnit.unitType?.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  useEffect(() => {
    if (defaultUnit) {
      if (rentType === "fixed") {
        setValue("monthlyIncomeMin", defaultUnit.monthlyIncomeMin)
        setValue("monthlyRent", defaultUnit.monthlyRent)
      } else {
        setValue("monthlyRentAsPercentOfIncome", defaultUnit.monthlyRentAsPercentOfIncome)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentType])

  return (
    <Form onSubmit={() => false}>
      <div className="border rounded-md p-8 bg-white">
        <GridSection title={t("listings.unit.details")} columns={4}>
          <GridCell>
            <ViewItem label={t("listings.unit.unitNumber")}>
              <Field
                id="number"
                name="number"
                label={t("listings.unit.unitNumber")}
                placeholder={t("listings.unit.unitNumber")}
                register={register}
                type="text"
                readerOnly
              />
            </ViewItem>
          </GridCell>
          <GridCell>
            <ViewItem label={t("listings.unit.type")}>
              <Select
                id="unitType.id"
                name="unitType.id"
                label={t("listings.unit.type")}
                placeholder={t("listings.unit.type")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={options.unitTypes}
                error={fieldHasError(errors?.unitType)}
                errorMessage={t("errors.requiredFieldError")}
                validation={{ required: true }}
              />
            </ViewItem>
          </GridCell>
          <GridCell>
            <ViewItem label={t("listings.unit.numBathrooms")}>
              <Select
                id="numBathrooms"
                name="numBathrooms"
                label={t("listings.unit.numBathrooms")}
                placeholder={t("listings.unit.numBathrooms")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={numberOptions(5)}
              />
            </ViewItem>
          </GridCell>
          <GridCell>
            <ViewItem label={t("listings.unit.floor")}>
              <Select
                id="floor"
                name="floor"
                label={t("listings.unit.floor")}
                placeholder={t("listings.unit.floor")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={numberOptions(10)}
              />
            </ViewItem>
          </GridCell>
          <GridCell>
            <ViewItem label={t("listings.unit.squareFootage")}>
              <Field
                id="sqFeet"
                name="sqFeet"
                label={t("listings.unit.squareFootage")}
                placeholder={t("listings.unit.squareFootage")}
                register={register}
                readerOnly
                type="number"
              />
            </ViewItem>
          </GridCell>
          <GridCell>
            <ViewItem label={t("listings.unit.unitStatus")}>
              <Select
                id="status"
                name="status"
                label={t("listings.unit.unitStatus")}
                placeholder={t("listings.unit.unitStatus")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={unitStatusOptions}
                disabled
              />
            </ViewItem>
          </GridCell>
          <GridCell>
            <ViewItem label={t("listings.unit.minOccupancy")}>
              <Select
                id="minOccupancy"
                name="minOccupancy"
                label={t("listings.unit.minOccupancy")}
                placeholder={t("listings.unit.minOccupancy")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={numberOptions(10)}
              />
            </ViewItem>
          </GridCell>
          <GridCell>
            <ViewItem label={t("listings.unit.maxOccupancy")}>
              <Select
                id="maxOccupancy"
                name="maxOccupancy"
                label={t("listings.unit.maxOccupancy")}
                placeholder={t("listings.unit.maxOccupancy")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={numberOptions(10)}
              />
            </ViewItem>
          </GridCell>
        </GridSection>
        <GridSection title={t("listings.unit.eligibility")} columns={4} separator>
          <GridCell>
            <ViewItem label={t("listings.unit.amiChart")}>
              <Select
                id="amiChart.id"
                name="amiChart.id"
                label={t("listings.unit.amiChart")}
                placeholder={t("listings.unit.amiChart")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={options.amiCharts}
                inputProps={{
                  onChange: () => {
                    if (amiChartID && !loading && options) {
                      void fetchAmiChart()
                    }
                  },
                }}
              />
            </ViewItem>
          </GridCell>
          <GridCell>
            <ViewItem label={t("listings.unit.amiPercentage")}>
              <Select
                name="amiPercentage"
                label={t("listings.unit.amiPercentage")}
                placeholder={t("listings.unit.amiPercentage")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={amiChartPercentageOptions}
              />
            </ViewItem>
          </GridCell>
        </GridSection>
        <GridSection columns={2} className="pt-6">
          <GridCell>
            <table className={"w-full text-sm td-plain th-plain"}>
              <thead>
                <tr>
                  <th>{t("listings.householdSize")}</th>
                  <th>{t("listings.maxAnnualIncome")}</th>
                </tr>
              </thead>
              <tbody>{getAmiChartTableData()}</tbody>
            </table>
          </GridCell>
        </GridSection>
        <GridSection columns={4} className="pt-6">
          <GridCell>
            <ViewItem label={t("listings.unit.rentType")}>
              <FieldGroup
                name="rentType"
                type="radio"
                register={register}
                fields={rentTypeOptions}
                fieldClassName="m-0"
                fieldGroupClassName="flex h-12 items-center"
              />
            </ViewItem>
          </GridCell>
          {rentType === "fixed" && (
            <>
              <GridCell>
                <ViewItem label={t("t.minimumIncome")}>
                  <Field
                    id="monthlyIncomeMin"
                    name="monthlyIncomeMin"
                    label={t("t.minimumIncome")}
                    placeholder="0.00"
                    register={register}
                    type="number"
                    prepend="$"
                    readerOnly
                  />
                </ViewItem>
              </GridCell>
              <GridCell>
                <ViewItem label={t("listings.unit.monthlyRent")}>
                  <Field
                    id="monthlyRent"
                    name="monthlyRent"
                    label={t("listings.unit.monthlyRent")}
                    placeholder="0.00"
                    register={register}
                    type="number"
                    prepend="$"
                    readerOnly
                  />
                </ViewItem>
              </GridCell>
            </>
          )}
          {rentType === "percentage" && (
            <>
              <GridCell>
                <ViewItem label={t("listings.unit.percentage")}>
                  <Field
                    id="monthlyRentAsPercentOfIncome"
                    name="monthlyRentAsPercentOfIncome"
                    label={t("listings.unit.%incomeRent")}
                    placeholder={t("listings.unit.percentage")}
                    register={register}
                    type="number"
                    readerOnly
                  />
                </ViewItem>
              </GridCell>
            </>
          )}
        </GridSection>
        <GridSection title={t("t.accessibility")} columns={4} separator>
          <GridCell>
            <ViewItem label={t("listings.unit.accessibilityPriorityType")}>
              <Select
                id="priorityType.id"
                name="priorityType.id"
                label={t("listings.unit.accessibilityPriorityType")}
                placeholder={t("listings.unit.accessibilityPriorityType")}
                labelClassName="sr-only"
                register={register}
                controlClassName="control"
                options={options.unitPriorities}
              />
            </ViewItem>
          </GridCell>
        </GridSection>
      </div>
      <div className="mt-6">
        {!draft ? (
          <Button
            type="button"
            onClick={() => copyAndNew()}
            styleType={AppearanceStyleType.secondary}
            className="mr-4"
          >
            {t("t.copy")}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => onFormSubmit("save")}
            styleType={AppearanceStyleType.secondary}
            className="mr-4"
          >
            {t("t.save")}
          </Button>
        )}
        <Button
          type="button"
          onClick={() => onFormSubmit("saveNew")}
          styleType={AppearanceStyleType.secondary}
          className="mr-4"
        >
          {t("t.saveNew")}
        </Button>

        <Button
          type="button"
          onClick={() => onFormSubmit("saveExit")}
          styleType={AppearanceStyleType.primary}
        >
          {t("t.saveExit")}
        </Button>

        <Button
          type="button"
          onClick={() => onClose(false, false, null)}
          styleType={AppearanceStyleType.secondary}
          border={AppearanceBorderType.borderless}
        >
          {t("t.cancel")}
        </Button>
      </div>
    </Form>
  )
}

export default UnitForm
