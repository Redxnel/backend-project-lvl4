install:
	npm install

start:
	DEBUG="application:*" npx nodemon --watch .  --ext '.js' --exec npx gulp server

publish:
	npm publish

lint:
	npx eslint .

test:
	npm test

.PHONY: test