
all:
	tsc *.ts
	browserify browser.js -o browser-bundle.js
	browserify webworker.js -o webworker-bundle.js

clean:
	rm *.js
