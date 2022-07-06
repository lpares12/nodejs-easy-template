# nodejs-easy-template

An template for a web-app using Express4 and Mongoose. 

This template includes the following features:

- User management: basic login and registration of a user with password recovery and email verification.

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

## User Management

The users can login using either their email or username. To register they must provide a valid email and verify it to become active.
Display of a profile site for logged users. Users can reset their passwords either through the profile or by clicking on "forgot password" in the login page.

Some validators are available in the `middleware` folder to redirect the user when logged in to the user profile page or not logged in to the index page.
