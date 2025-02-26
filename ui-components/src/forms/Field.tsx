import React, { useMemo } from "react"
import { ErrorMessage } from "../notifications/ErrorMessage"
import { UseFormMethods, RegisterOptions } from "react-hook-form"

export interface FieldProps {
  error?: boolean
  errorMessage?: string
  className?: string
  controlClassName?: string
  caps?: boolean
  primary?: boolean
  readerOnly?: boolean
  type?: string
  id?: string
  name: string
  note?: string | JSX.Element
  subNote?: string
  label?: string
  defaultValue?: string | number
  onDrop?: (e: React.DragEvent<HTMLElement>) => boolean
  onPaste?: (e: React.ClipboardEvent) => boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  register?: UseFormMethods["register"]
  validation?: RegisterOptions
  disabled?: boolean
  prepend?: string
  inputProps?: Record<string, unknown>
  describedBy?: string
  getValues?: UseFormMethods["getValues"]
  setValue?: UseFormMethods["setValue"]
  dataTestId?: string
  hidden?: boolean
}

const Field = (props: FieldProps) => {
  const classes = ["field"]
  if (props.error) {
    classes.push("error")
  }

  if (props.className) {
    classes.push(props.className)
  }

  const controlClasses = []

  if (props.type !== "checkbox") {
    controlClasses.push("control")
  }

  if (props.controlClassName) {
    controlClasses.push(props.controlClassName)
  }

  const formatValue = () => {
    if (props.getValues && props.setValue) {
      const currencyValue = props.getValues(props.name)
      const numericIncome = parseFloat(currencyValue)
      if (!isNaN(numericIncome)) {
        props.setValue(props.name, numericIncome.toFixed(2))
      }
    }
  }

  let inputProps = { ...props.inputProps }
  if (props.type === "currency") inputProps = { ...inputProps, step: 0.01, onBlur: formatValue }

  const type = (props.type === "currency" && "number") || props.type || "text"
  const isRadioOrCheckbox = ["radio", "checkbox"].includes(type)

  const label = useMemo(() => {
    const labelClasses = ["label"]
    if (props.caps) labelClasses.push("field-label--caps")
    if (props.primary) labelClasses.push("text-primary")
    if (props.readerOnly) labelClasses.push("sr-only")

    return (
      <label className={labelClasses.join(" ")} htmlFor={props.id || props.name}>
        {props.label}
      </label>
    )
  }, [props.caps, props.primary, props.readerOnly, props.id, props.name, props.label])

  const idOrName = props.id || props.name

  let note = <></>
  if (props.note) {
    note = <p className="field-note mb-4">{props.note}</p>
  }

  return (
    <div className={classes.join(" ")}>
      {!isRadioOrCheckbox && !props.hidden && label}
      {note}
      <div className={controlClasses.join(" ")}>
        {props.prepend && <span className="prepend">{props.prepend}</span>}
        <input
          aria-describedby={props.describedBy ? props.describedBy : `${idOrName}`}
          aria-invalid={!!props.error || false}
          className="input"
          type={type}
          id={idOrName}
          name={props.name}
          defaultValue={props.defaultValue}
          placeholder={props.placeholder}
          ref={props.register && props.register(props.validation)}
          disabled={props.disabled}
          onPaste={props.onPaste}
          onDrop={props.onDrop}
          onChange={props.onChange}
          data-test-id={props.dataTestId}
          {...inputProps}
          hidden={props.hidden}
        />
        {isRadioOrCheckbox && label}
      </div>
      {props.subNote && <p className="field-sub-note">{props.subNote}</p>}
      {props.errorMessage && (
        <ErrorMessage id={`${idOrName}-error`} error={props.error}>
          {props.errorMessage}
        </ErrorMessage>
      )}
    </div>
  )
}

export { Field as default, Field }
