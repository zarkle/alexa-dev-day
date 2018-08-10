/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Hello World, can you say hello?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  async handle(handlerInput) {
    let speechText = 'Hello World!';
    let repromptText = 'Try saying hello. ';
    const locale = handlerInput.requestEnvelope.request.locale;
    const monetizationService = await handlerInput.serviceClientFactory.getMonetizationServiceClient();
  
    const result = await monetizationService.getInSkillProducts(locale);
    const product = result.inSkillProducts[0]
    console.log(product);

    if (product.entitled === 'ENTITLED') {
      speechText = "Many years of happy days befall thee, my <emphasis level='strong'>gracious</emphasis> sovereign." 
      		+ "<audio src='https://s3.amazonaws.com/ask-soundlibrary/magic/amzn_sfx_fairy_melodic_chimes_01.mp3'/>";
    } else {
      upsell = product.summary + ' Say buy it now to make it happen!';
      speechText = 'Hello World. ' + upsell;
      repromptText = repromptText + upsell;
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HowAreYouIntentHandler = {

  canHandle(handlerInput) {
  		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    		&& handlerInput.requestEnvelope.request.intent.name === 'HowAreYouIntent';
  },
  handle(handlerInput) {

  	const speechText = 'I\'m fabulous!';

  	return handlerInput.responseBuilder
  		.speak(speechText)
  		.withSimpleCard('Hello World', speechText)
  		.getResponse();
  },
};

const BuyIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'BuyIntent';
},
async handle(handlerInput) {

  //retrieve skill locale
  const locale = handlerInput.requestEnvelope.request.locale; 
  
  //initialize the monetizationService
  const monetizationService = handlerInput.serviceClientFactory.getMonetizationServiceClient(); 
  
  //await expression pauses the rest of the execution until in-skill products are retrieved
  //retrieve all locale specific in-skill products
  const result = await monetizationService.getInSkillProducts(locale); 
  
  //set the product object
  const product = result.inSkillProducts[0]; 
  
  //send in-skill product payload as a directive to the Alexa service to handle the transaction
  return handlerInput.responseBuilder
      .addDirective({
          'type': 'Connections.SendRequest',
          'name': 'Buy',
          'payload': {
                      'InSkillProduct': {
                          'productId': product.productId
                      }
          },
          'token': 'correlationToken'
      })
      .getResponse();

    }
};

const BuyResponseHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'Connections.Response' &&
      handlerInput.requestEnvelope.request.name === 'Buy';
  },
  async handle(handlerInput) {
    console.log('IN BUYRESPONSEHANDLER');
    let speechText;
    let repromptText = "Try saying Hello!";
  
    const locale = handlerInput.requestEnvelope.request.locale;
    const monetizationService = handlerInput.serviceClientFactory.getMonetizationServiceClient();
  
    const result = await monetizationService.getInSkillProducts(locale)
    const product = result.inSkillProducts[0];
    
    //if and else statements driven by the customer's purchaseResult will alter the prompts to the customer
    if (handlerInput.requestEnvelope.request.status.code === '200') {
      if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'ACCEPTED') {
  
        speechText = 'We hope you enjoy it! ' + repromptText;
  
      }
      if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'DECLINED') {
        speechText = 'No problem. Thanks for your interest in ' + product.name + ' ' + repromptText;
  
      }
    } else {
        // Something failed.
        console.log(`Connections.Response indicated failure. error: ${handlerInput.requestEnvelope.request.status.message}`);
        speechText = 'There was an error handling your purchase request. Please try again or contact us for help.';
    }
  
  
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  
},
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HowAreYouIntentHandler,
    BuyIntentHandler,
    BuyResponseHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
