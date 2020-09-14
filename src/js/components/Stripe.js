import {useFetch} from '@/utils/useFetch'

export default class {
  apiBaseUrl = 'http://localhost:4000';
  cardNumberElement;
  cardCvcElement;
  cardExpiryElement;

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
    const paymentRequestButton = await this.createCardElement('paymentRequestButton', '#payment-request-button', paymentRequest)


    const cardNumber = this.createCardElement('cardNumber', '#card-number')
    const cardExpiry = this.createCardElement('cardExpiry', '#card-expiry')
    const cardCvc = this.createCardElement('cardCvc', '#card-cvc');

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
          const {token} = await this.stripe.createToken(cardNumber, tokenData);

          useFetch(`${this.apiBaseUrl}/payment/create-customer`, {email, name}, 'POST')
            .then((data) => {

              return data;
            })
            .then(async (customer) => {
              try {
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

                await this.createSubscription({
                  customerId: customer.id,
                  paymentMethodId: paymentMethod.id,
                  priceId: 'price_1HQu0LKrdDRwnIFxUorRkb2J',
                })
              } catch (e) {
                console.log(e)
              }

            })
            .catch(e => {
              console.log(e)
            });
        }
      )
    }

  }

  createSubscription({customerId, paymentMethodId, priceId}) {
    return (
      useFetch(`${this.apiBaseUrl}/payment/create-subscription`, {customerId, paymentMethodId, priceId}, 'POST')
        .then(result => {
          if (result.error) {
            // The card had an error when trying to attach it to a customer.
            throw result;
          }
          return result;
        })
        .then((result) => {
          return {
            paymentMethodId: paymentMethodId,
            priceId: priceId,
            subscription: result,
          };
        })
        .catch((error) => {
          // An error has happened. Display the failure to the user here.
          // We utilize the HTML element we created.
          console.log(error)
        })
    )
  }

  createCardElement(type, domElement, ...args) {
    const cardDomElement = document.querySelector(domElement)

    let displayError = document.getElementById('card-errors');

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
        console.log(e)
        if (e.error) {
          this.cardValidation(e.error)
          displayError.textContent = e.error.message;
        } else {
          displayError.textContent = '';
          this.cardValidation(null)
        }
      })

      return element;
    }

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

}
