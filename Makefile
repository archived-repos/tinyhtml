
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test release

install:
	npm install

eslint:
	$(shell npm bin)/eslint tinyhtml.js
	$(shell npm bin)/eslint tests

karma:
	@$(shell npm bin)/karma start karma.conf.js

test: install eslint
	@$(shell npm bin)/mocha tests

npm.publish:
	npm version patch
	git push origin $(git_branch) && git push --tags
	npm publish
	@echo "published ${PKG_VERSION}"s

github.release: export PKG_NAME=$(shell node -e "console.log(require('./package.json').name);")
github.release: export PKG_VERSION=$(shell node -e "console.log('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/kiltjs/${PKG_NAME}/releases" )
github.release:
	@echo ${RELEASE_URL}
	@true

release: test npm.publish github.release
