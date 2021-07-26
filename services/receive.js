/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger For Original Coast Clothing
 * https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing
 */

'use strict'

const Curation = require('./curation'),
  Order = require('./order'),
  Response = require('./response'),
  Care = require('./care'),
  Survey = require('./survey'),
  GraphApi = require('./graph-api'),
  i18n = require('../i18n.config')
const Course = require('./course')
const courseAction = require('./course-payload')

module.exports = class Receive {
  constructor(user, webhookEvent) {
    this.user = user
    this.webhookEvent = webhookEvent
  }

  // Check if the event is a message or postback and
  // call the appropriate handler function
  async handleMessage() {
    let event = this.webhookEvent
    console.log('event: ', event)

    let responses

    try {
      if (event.message) {
        let message = event.message

        if (message.quick_reply) {
          responses = await this.handleQuickReply()
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage()
        } else if (message.text) {
          responses = this.handleTextMessage()
        }
      } else if (event.postback) {
        console.log('waiting postback')
        responses = await this.handlePostback()
        console.log('response postback', responses)
      } else if (event.referral) {
        responses = await this.handleReferral()
      }
    } catch (error) {
      console.error(error)
      responses = {
        text: `An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`
      }
    }

    if (Array.isArray(responses)) {
      let delay = 0
      for (let response of responses) {
        this.sendMessage(response, delay * 2000)
        delay++
      }
    } else {
      this.sendMessage(responses)
    }
  }

  // Handles messages events with text
  handleTextMessage() {
    console.log(
      'Received text:',
      `${this.webhookEvent.message.text} for ${this.user.psid}`
    )

    let event = this.webhookEvent

    // check greeting is here and is confident
    let greeting = this.firstEntity(event.message.nlp, 'greetings')
    let message = event.message.text.trim().toLowerCase()

    let response

    if (
      (greeting && greeting.confidence > 0.8) ||
      message.includes('start over')
    ) {
      response = Response.genNuxMessage(this.user)
    } else if (Number(message)) {
      response = Order.handlePayload('ORDER_NUMBER')
    } else if (message.includes('#')) {
      response = Survey.handlePayload('CSAT_SUGGESTION')
    } else if (message.includes(i18n.__('care.help').toLowerCase())) {
      let care = new Care(this.user, this.webhookEvent)
      response = care.handlePayload('CARE_HELP')
    } else {
      response = [
        Response.genText(
          i18n.__('fallback.any', {
            message: event.message.text
          })
        ),
        Response.genText(i18n.__('get_started.guidance')),
        Response.genQuickReply(i18n.__('get_started.help'), [
          {
            title: i18n.__('menu.course_by_kw'),
            payload: courseAction.searchByKw
          },
          {
            title: i18n.__('menu.category'),
            payload: courseAction.categories
          }
        ])
      ]
    }

    return response
  }

  // Handles mesage events with attachments
  handleAttachmentMessage() {
    let response

    // Get the attachment
    let attachment = this.webhookEvent.message.attachments[0]
    console.log('Received attachment:', `${attachment} for ${this.user.psid}`)

    response = Response.genQuickReply(i18n.__('fallback.attachment'), [
      {
        title: i18n.__('menu.help'),
        payload: 'CARE_HELP'
      },
      {
        title: i18n.__('menu.start_over'),
        payload: 'GET_STARTED'
      }
    ])

    return response
  }

  // Handles mesage events with quick replies
  handleQuickReply() {
    // Get the payload of the quick reply
    let payload = this.webhookEvent.message.quick_reply.payload

    return this.handlePayload(payload)
  }

  // Handles postbacks events
  async handlePostback() {
    console.log('postback: ', postback)
    let postback = this.webhookEvent.postback
    // Check for the special Get Starded with referral
    let payload
    if (postback.payload) {
      // Get the payload of the postback
      payload = postback.payload
    } else if (postback.referral && postback.referral.type == 'OPEN_THREAD') {
      payload = postback.referral.ref
    }

    return await this.handlePayload(payload.toUpperCase())
  }

  // Handles referral events
  handleReferral() {
    // Get the payload of the postback
    let payload = this.webhookEvent.referral.ref.toUpperCase()

    return this.handlePayload(payload)
  }

  async handlePayload(payload) {
    console.log('Received Payload:', `${payload} for ${this.user.psid}`)

    let response

    // Set the response based on the payload
    if (payload.includes('GET_STARTED')) {
      response = Response.genNuxMessage(this.user)
    } else if (payload.includes('COURSE')) {
      const course = new Course(this.user, this.webhookEvent)
      response = await course.handlePayload(payload)
    } else {
      response = {
        text: `This is a default postback message for payload: ${payload}!`
      }
    }

    // if (
    //     payload === "GET_STARTED" ||
    //     payload === "DEVDOCS" ||
    //     payload === "GITHUB"
    // ) {
    //     response = Response.genNuxMessage(this.user);
    // } else if (payload.includes("CURATION") || payload.includes("COUPON")) {
    //     let curation = new Curation(this.user, this.webhookEvent);
    //     response = curation.handlePayload(payload);
    // } else if (payload.includes("CARE")) {
    //     let care = new Care(this.user, this.webhookEvent);
    //     response = care.handlePayload(payload);
    // } else if (payload.includes("ORDER")) {
    //     response = Order.handlePayload(payload);
    // } else if (payload.includes("CSAT")) {
    //     response = Survey.handlePayload(payload);
    // } else if (payload.includes("CHAT-PLUGIN")) {
    //     response = [
    //         Response.genText(i18n.__("chat_plugin.prompt")),
    //         Response.genText(i18n.__("get_started.guidance")),
    //         Response.genQuickReply(i18n.__("get_started.help"), [
    //             {
    //                 title: i18n.__("care.order"),
    //                 payload: "CARE_ORDER"
    //             },
    //             {
    //                 title: i18n.__("care.billing"),
    //                 payload: "CARE_BILLING"
    //             },
    //             {
    //                 title: i18n.__("care.other"),
    //                 payload: "CARE_OTHER"
    //             }
    //         ])
    //     ];
    // } else {
    //     response = {
    //         text: `This is a default postback message for payload: ${payload}!`
    //     };
    // }

    return response
  }

  handlePrivateReply(type, object_id) {
    console.log('handlePrivateReply: ', type)
    let welcomeMessage =
      i18n.__('get_started.welcome') +
      ' ' +
      i18n.__('get_started.guidance') +
      '. ' +
      i18n.__('get_started.help')

    let response = Response.genQuickReply(welcomeMessage, [
      {
        title: i18n.__('menu.course_by_kw'),
        payload: courseAction.searchByKw
      },
      {
        title: i18n.__('menu.category'),
        payload: courseAction.categories
      }
    ])

    let requestBody = {
      recipient: {
        [type]: object_id
      },
      message: response
    }

    GraphApi.callSendApi(requestBody)
  }

  sendMessage(response, delay = 0) {
    console.log('step: send message')
    // Check if there is delay in the response
    try {
      if ('delay' in response) {
        delay = response['delay']
        delete response['delay']
      }

      // Construct the message body
      let requestBody = {
        recipient: {
          id: this.user.psid
        },
        message: response
      }

      // Check if there is persona id in the response
      if ('persona_id' in response) {
        let persona_id = response['persona_id']
        delete response['persona_id']

        requestBody = {
          recipient: {
            id: this.user.psid
          },
          message: response,
          persona_id: persona_id
        }
      }
      console.log('requestBody: ', requestBody)
      setTimeout(() => GraphApi.callSendApi(requestBody), delay)
    } catch (err) {
      console.log('send message err: ', err)
    }
  }

  firstEntity(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0]
  }
}
