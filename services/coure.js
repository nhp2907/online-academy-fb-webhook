const Response = require('response')
const i18n = require('../i18n.config')
const config = require('./config')

module.exports = class Course {
  constructor(user, webhookEvent) {
    this.user = user
    this.webhookEvent = webhookEvent
  }

  handlePayload(payload) {
    let response
    let outfit

    switch (payload) {
      case 'SEARCH_COURSE_BY_KW':
        response = [
          Response.genText(
            i18n.__('leadgen.promo', {
              userFirstName: this.user.firstName
            })
          ),
          Response.genGenericTemplate(
            `${config.appUrl}/coupon.png`,
            i18n.__('leadgen.title'),
            i18n.__('leadgen.subtitle'),
            [Response.genPostbackButton(i18n.__('leadgen.apply'), 'COUPON_50')]
          )
        ]
        break

      case 'CATEGORY':
        outfit = `${this.user.gender}-${this.randomOutfit()}`

        response = [
          Response.genText(i18n.__('leadgen.coupon')),
          Response.genGenericTemplate(
            `${config.appUrl}/styles/${outfit}.jpg`,
            i18n.__('curation.title'),
            i18n.__('curation.subtitle'),
            [
              Response.genWebUrlButton(
                i18n.__('curation.shop'),
                `${config.shopUrl}/products/${outfit}`
              ),
              Response.genPostbackButton(
                i18n.__('curation.show'),
                'CURATION_OTHER_STYLE'
              ),
              Response.genPostbackButton(
                i18n.__('curation.sales'),
                'CARE_SALES'
              )
            ]
          )
        ]
        break

      case 'CURATION':
        response = Response.genQuickReply(i18n.__('curation.prompt'), [
          {
            title: i18n.__('curation.me'),
            payload: 'CURATION_FOR_ME'
          },
          {
            title: i18n.__('curation.someone'),
            payload: 'CURATION_SOMEONE_ELSE'
          }
        ])
        break

      case 'CURATION_FOR_ME':
      case 'CURATION_SOMEONE_ELSE':
        response = Response.genQuickReply(i18n.__('curation.occasion'), [
          {
            title: i18n.__('curation.work'),
            payload: 'CURATION_OCASION_WORK'
          },
          {
            title: i18n.__('curation.dinner'),
            payload: 'CURATION_OCASION_DINNER'
          },
          {
            title: i18n.__('curation.party'),
            payload: 'CURATION_OCASION_PARTY'
          },
          {
            title: i18n.__('curation.sales'),
            payload: 'CARE_SALES'
          }
        ])
        break

      case 'CURATION_OCASION_WORK':
        // Store the user budget preference here
        response = Response.genQuickReply(i18n.__('curation.price'), [
          {
            title: '~ $20',
            payload: 'CURATION_BUDGET_20_WORK'
          },
          {
            title: '~ $30',
            payload: 'CURATION_BUDGET_30_WORK'
          },
          {
            title: '+ $50',
            payload: 'CURATION_BUDGET_50_WORK'
          }
        ])
        break

      case 'CURATION_OCASION_DINNER':
        // Store the user budget preference here
        response = Response.genQuickReply(i18n.__('curation.price'), [
          {
            title: '~ $20',
            payload: 'CURATION_BUDGET_20_DINNER'
          },
          {
            title: '~ $30',
            payload: 'CURATION_BUDGET_30_DINNER'
          },
          {
            title: '+ $50',
            payload: 'CURATION_BUDGET_50_DINNER'
          }
        ])
        break

      case 'CURATION_OCASION_PARTY':
        // Store the user budget preference here
        response = Response.genQuickReply(i18n.__('curation.price'), [
          {
            title: '~ $20',
            payload: 'CURATION_BUDGET_20_PARTY'
          },
          {
            title: '~ $30',
            payload: 'CURATION_BUDGET_30_PARTY'
          },
          {
            title: '+ $50',
            payload: 'CURATION_BUDGET_50_PARTY'
          }
        ])
        break

      case 'CURATION_BUDGET_20_WORK':
      case 'CURATION_BUDGET_30_WORK':
      case 'CURATION_BUDGET_50_WORK':
      case 'CURATION_BUDGET_20_DINNER':
      case 'CURATION_BUDGET_30_DINNER':
      case 'CURATION_BUDGET_50_DINNER':
      case 'CURATION_BUDGET_20_PARTY':
      case 'CURATION_BUDGET_30_PARTY':
      case 'CURATION_BUDGET_50_PARTY':
        response = this.genCurationResponse(payload)
        break

      case 'CURATION_OTHER_STYLE':
        // Build the recommendation logic here
        outfit = `${this.user.gender}-${this.randomOutfit()}`

        response = Response.genGenericTemplate(
          `${config.appUrl}/styles/${outfit}.jpg`,
          i18n.__('curation.title'),
          i18n.__('curation.subtitle'),
          [
            Response.genWebUrlButton(
              i18n.__('curation.shop'),
              `${config.shopUrl}/products/${outfit}`
            ),
            Response.genPostbackButton(
              i18n.__('curation.show'),
              'CURATION_OTHER_STYLE'
            )
          ]
        )
        break
    }

    return response
  }
}