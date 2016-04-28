# RethinkDB Demo App

Simple realtime persistent messaging application

- Realtime messaging (modeling relationships by linking documents with multiple tables)
- Profile badges (modeling relationships with embedded arrays)

## Usage
Run the chat log in one terminal and then open another terminal
for each username you want to send messages from. The chat log
will automatically update whenever a new message is sent. You
can even use multiple chat logs if you like.

- `npm run log` - Prints out all existing messages and then continuously outputs new messages as they arrive
- `npm run send [username]` - Sends messages as a username, user is created automatically when the first message is sent
