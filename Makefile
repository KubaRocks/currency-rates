SHELL := /bin/bash

VERSION_FILE := VERSION

.PHONY: version next-version release

version:
	@cat $(VERSION_FILE)

next-version:
	@today="v$$(date +%Y.%m.%d)"; \
	versions="$$(gh release list --limit 200 --json tagName --jq '.[].tagName' 2>/dev/null | grep -E "^$${today}(\\.[0-9]+)?$$" || true)"; \
	node scripts/next-version.mjs $$versions

release:
	@command -v gh >/dev/null || { echo "gh is required"; exit 1; }; \
	command -v git >/dev/null || { echo "git is required"; exit 1; }; \
	gh auth status >/dev/null || { echo "gh is not authenticated"; exit 1; }; \
	[[ -z "$$(git status --porcelain)" ]] || { echo "working tree must be clean"; exit 1; }; \
	branch="$$(git branch --show-current)"; \
	[[ -n "$$branch" ]] || { echo "detached HEAD is not supported"; exit 1; }; \
	version="$$( $(MAKE) --no-print-directory next-version )"; \
	printf '%s\n' "$$version" > $(VERSION_FILE); \
	git add $(VERSION_FILE); \
	git commit -m "chore: release $$version"; \
	git push origin "$$branch"; \
	git tag "$$version"; \
	git push origin "$$version"; \
	gh release create "$$version" --title "$$version" --generate-notes --verify-tag; \
	echo "$$version"
