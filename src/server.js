const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const Stripe = require('stripe');
const path = require('path');

const port = process.env.PORT || 3000;

const stripe = Stripe('sk_test_51HPO4FKrdDRwnIFxWwGX9eVubWTPPvBaNB4B5lwytPbFoeEdkl5bUFnq8lJ3x2U2BHiRqXlUSIRBeyJ7kVhQcdf700IqsOgDqo');

// parse application/json
app.use(bodyParser.json());
// static
app.use(express.static(path.join(process.cwd(), 'dist', 'public')));


app.post('/payment/create-customer', async (req, res) => {
  const {email, name, country, zip} = req.body;

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      address: {
        line1: '',
        country,
        postal_code: zip
      }
    });

    res.json({
      customer
    })
  } catch (error) {
    res.json({
      error
    })
  }
})

app.post('/payment/create-subscription', async (req, res) => {
  const {customerId, paymentMethodId, priceId} = req.body;

  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Change the default invoice settings on the customer to the new payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{price: priceId}],
      cancel_at_period_end: true, // Boolean indicating whether this subscription should cancel at the end of the current period.
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({subscription})
  } catch (error) {
    return res.status(400).json({error});
  }
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
