# nodejs-easy-template

An template for a web-app using Express4 and Mongoose. 

This template includes the following features:

- User management: basic login and registration of a user.

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
Display of a profile site for logged users.

Some validators are available in the `middleware` folder to redirect the user when logged in to the user profile page or not logged in to the index page.
