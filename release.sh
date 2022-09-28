VERSION=$1

if [ "$1" == "" ]; then
  echo "No argument provided. Tag number required."
  exit 0
fi

read -r -p "Are you sure you want to release ${VERSION}? [y/N] " response
case "$response" in
    [yY][eE][sS]|[yY])
      git pull

      echo "Releasing ${VERSION}..."

      npm run build

      # replace version in the snapcraft yaml
      echo "Inject version ${VERSION} into snapcraft.yaml..."
      sed  -i "" -Ee "s/^version: .*/version: \"${VERSION}\"/" snap/snapcraft.yaml

      # replace version in the package json
      echo "Inject version ${VERSION} into package.json..."
      sed -i "" -Ee "s/\s*\"version\": .*/\"version\": \"${VERSION}\",/" package.json

      # replace version in the package json
      echo "Inject version ${VERSION} into public index.html..."
      sed -i "" -Ee "s/\s*<p>Version .*<\/p>/\<p>Version ${VERSION}<\/p>/" public/http/index.html

      # replace version in the package json
      echo "Inject version ${VERSION} into secure index.html..."
      sed -i "" -Ee "s/\s*<p>Version .*<\/p>/\<p>Version ${VERSION}<\/p>/" public/https/index.html

      echo "Adding remaining files to repo"
      git add .
      git commit -m "version bump and dist commit for release ${VERSION}"

      echo "Tag and push"
      git tag ${VERSION}
      git push
      git push --tags

      echo "Running test... building packages (testing package.json)..."
      yarn

      echo "Running test... Launching hub execute"
      node execute.js
        ;;
    *)
        exit 0
        ;;
esac
