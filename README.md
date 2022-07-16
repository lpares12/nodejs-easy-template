# nodejs-easy-template

An template for a web-app using Express4 and Mongoose. 

This template includes the following features:

- User management: basic login and registration of a user with password recovery and email verification.
- Stripe integration: managing user subscriptions using Stripe.

## Architecture

The current design is based on DDD + hexagonal architecture. We can find a folder application which contains the main sources. Inside this folder we find:

- controller: contains the controllers, which are the entry points of the application. In this case, since it will only be accessible through a web app, we only have http controller.
- application: contains the commands/use cases that are available for execution. Gets called by the controllers and executes the commands on the repository. Also interacts with the external ports/interfaces.
- domain: currently only contains the model of the application. In this case, it is totally integrated with mongoose.
- infrastructure: implementation of the interfaces to access the models and external libraries. In this case we have the methods to save/update/remove data from Mongo database, and interaction with email

## Dependencies

- Express4: minimal web framework
- mongoose: MongoDB ODM
- express-session: manage express sessions
- connect-mongodb-session: manage sessions with MongoDB
- nunjucks: for rendering templates similar to Django's Jinja
- validator: to validate email format
- bcrypt: hashing and salting of passwords 
- stripe: for managing user subscriptions

## User Management

The users can login using either their email or username. To register they must provide a valid email and verify it to become active.
Display of a profile site for logged users. Users can reset their passwords either through the profile or by clicking on "forgot password" in the login page.

Some validators are available in the `middleware` folder to redirect the user when logged in to the user profile page or not logged in to the index page.


## Stripe

When a user validates his email, an Stripe customer will be created with his name and email.

Then the user will go through a trial period and it will be offered to buy a subscription using Stripe checkout portal. The user can manage his subscription through Stripe customer portal.

The application listens for changes in Stripe using a webhook and will synchronize with it whenever a user subscribes/unsubscribes.

We will need to define the following environment variables:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET = self explanatory
- PRODUCT_BASIC = this is a price ID of a product that was created in stripe, it looks like "price_1LJ34243243a"
- TRIAL_DAYS = ammount of trial days we are offering the users

Also, for the webhook to work we will need to call in another terminal:
```
stripe listen --forward-to localhost:5656/subscription/stripe/webhook
```

## Set up

You should copy `.env.example` file and modify the variables according to your setup.
