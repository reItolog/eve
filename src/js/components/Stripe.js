import {useFetch} from '@/utils/useFetch';
import client from '../../utils/client';

export default class {
  apiBaseUrl = 'http://localhost:3000';
  cardNumberElement;
  cardCvcElement;
  cardExpiryElement;
  displayError;

  submitButton;

  isSending = false;

  stripe;

  style = {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  };

  constructor() {
    this.init()
    this.stripeInit()
  }

  init() {
    this.cardNumberElement = document.getElementById('card-number')
    this.cardExpiryElement = document.getElementById('card-expiry')
    this.cardCvcElement = document.getElementById('card-cvc')
    this.displayError = document.getElementById('card-errors')
    this.submitButton = document.querySelector('.SubmitButton')
    this.stripe = Stripe('pk_test_51HPO4FKrdDRwnIFxHCzsnj0JRYMGDz4wzEdpCYGMykoX4jxxBXv4MbcVlJWSLKQtElZdzShpgZ5UvS1C9mQGEmwg00u9uMNihW')
    this.elements = this.stripe.elements();
  }

  async stripeInit() {
    // PAYMENT REQUEST BUTTON
    const paymentRequest = await this.stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Demo total',
        amount: 1099,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    await this.createCardElement('paymentRequestButton', '#payment-request-button', paymentRequest)

    const cardNumber = this.createCardElement('cardNumber', '#card-number')
    this.createCardElement('cardExpiry', '#card-expiry')
    this.createCardElement('cardCvc', '#card-cvc');

    const form = document.getElementById('stripe-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
          e.preventDefault()

          const email = document.querySelector('input[name="email"]').value;
          const country = document.querySelector('select[name="billingCountry"]').value;
          const name = document.querySelector('input[name="name"]').value;
          const zip = document.querySelector('input[name="zip"]').value;

          const tokenData = {
            name,
            address_country: country
          }
          const {error, token} = await this.stripe.createToken(cardNumber, tokenData);

          if (error) {
            this.validationError(error)
          } else {
            this.validationError(null)
          }

          if (!token) {
            return
          }
          // DISABLED SUBMIT BUTTON for NO DOUBLE REQUEST
          this.submitButton.classList.add('SubmitButton__disabled');
          this.submitButton.disabled = true;

          try {
            const {customer} = await useFetch(`${this.apiBaseUrl}/payment/create-customer`, {
              email,
              name,
              country,
              zip
            }, 'POST');

            const {paymentMethod} = await this.stripe.createPaymentMethod({
              type: 'card',
              card: {
                token: token.id
              },
              billing_details: {
                email: email,
                name: name,
                address: {
                  country: country,
                  postal_code: zip
                }
              },
            });

            const {subscription} = await this.createSubscription({
              customerId: customer.id,
              paymentMethodId: paymentMethod.id,
              priceId: 'price_1HRtUQKrdDRwnIFxrWFwC7xL',
            });

            await this.createCustomer(subscription)

            await this.subscriptionSuccess();
          } catch (e) {
            console.log(e)
          }
        }
      )
    }

  }

  async createSubscription({customerId, paymentMethodId, priceId}) {
    try {
      const {subscription} = await useFetch(`${this.apiBaseUrl}/payment/create-subscription`, {
        customerId,
        paymentMethodId,
        priceId
      }, 'POST');

      return {
        paymentMethodId,
        priceId,
        subscription,
      };
    } catch (e) {
      throw new Error(e)
    }
  }

  async createCustomer(subscription) {
    const customerDoc = {
      _type: 'customer',
      customerId: subscription.customer,
      subscriptionId: subscription.latest_invoice.subscription,
      collection_method: subscription.collection_method,
      productId: subscription.plan.product,
      priceId: subscription.plan.id,
      status: subscription.status
    }

    try {
      await client.create(customerDoc);
    } catch (e) {
      throw new Error(`Create Customer Error: ${e.message}`)
    }
  }

  createCardElement(type, domElement, ...args) {
    const cardDomElement = document.querySelector(domElement)

    if (cardDomElement) {
      const elements = this.elements;

      if (type === 'paymentRequestButton') {
        const paymentRequest = args[0];

        const prButton = elements.create(
          'paymentRequestButton',
          {
            paymentRequest: paymentRequest,
            style: {
              paymentRequestButton: {
                type: 'default',
                // One of 'default', 'book', 'buy', or 'donate'
                // Defaults to 'default'

                theme: 'dark',
              },
            },
          },
        );


        // Check the availability of the Payment Request API first.
        paymentRequest.canMakePayment().then(function (result) {
          if (result) {
            prButton.mount(domElement);
          } else {
            document.getElementById('payment-request-button').style.display = 'none';
          }
        });

        return prButton;
      }

      const element = elements.create(type, {style: this.style});

      element.mount(domElement);

      element.on('change', (e) => {
        this.validationError(e.error)
      })
      return element;
    }
  }

  async subscriptionSuccess() {
    console.log('Sub Success')
    // alert('Success')
  }

  cardValidation(error) {
    if (error) {
      this.cardNumberElement.classList.add('CardValidationError')
      this.cardCvcElement.classList.add('CardValidationError')
      this.cardExpiryElement.classList.add('CardValidationError')
    } else {
      this.cardNumberElement.classList.remove('CardValidationError')
      this.cardCvcElement.classList.remove('CardValidationError')
      this.cardExpiryElement.classList.remove('CardValidationError')
    }
  }

  validationError(error) {
    if (error) {
      this.cardValidation(error)
      this.displayError.textContent = error.message;
    } else {
      this.displayError.textContent = '';
      this.cardValidation(null)
    }
  }

}
