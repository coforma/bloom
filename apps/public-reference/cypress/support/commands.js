/* eslint-disable no-undef */

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import * as routes from "../fixtures/routes.json"

Cypress.Commands.add("getByID", (id, ...args) => {
  return cy.get(`#${CSS.escape(id)}`, ...args)
})

Cypress.Commands.add("goNext", () => {
  return cy.get("button").contains("Next").click()
})

Cypress.Commands.add("loadConfig", (initialValues) => {
  cy.fixture("applicationConfig.json").then((applicationConfig) => {
    // const keysToReplace = initialValues && Object.keys(initialValues)

    // function replacer(key) {
    //   if (initialValues && keysToReplace && keysToReplace.includes(key)) {
    //     return {
    //       [key]: initialValues[key],
    //     }
    //   }
    // }

    // const values = JSON.stringify(applicationConfig, replacer)
    const values = JSON.stringify(applicationConfig)

    sessionStorage.setItem("bloom-app-autosave", values)
  })

  cy.fixture("listing.json").then((listingData) => {
    sessionStorage.setItem("bloom-app-listing", JSON.stringify(listingData))
  })
})

Cypress.Commands.add("getSubmissionContext", () => {
  const config = sessionStorage.getItem("bloom-app-autosave")
  return JSON.parse(config)
})

Cypress.Commands.add("checkErrorAlert", (command) => {
  cy.get(".alert-box").should(command)
})

Cypress.Commands.add("checkErrorMessages", (command) => {
  cy.get(".error-message").should(command)
})

Cypress.Commands.add("isNextRouteValid", (currentStep) => {
  cy.fixture("listing.json").then((listingData) => {
    const steps = listingData.applicationConfig.steps

    const nextRouteIndex = steps.findIndex((item) => item.name === currentStep) + 1
    const nextRouteName = steps[nextRouteIndex] ? steps[nextRouteIndex].name : ""
    const nextRoutePath = routes[nextRouteName]

    cy.location("pathname").should("include", nextRoutePath)
  })
})
