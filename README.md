# DEGov Interpreter Typescript

This repo contains a system to store and track governance files on both mobile and web. 

### Dependencies
Both mobile and web are dependent on fetch

Mobile is dependent on [React Native Async Storage](https://www.npmjs.com/package/@react-native-async-storage/async-storage)

Web is dependent on the [Node File system](https://nodejs.org/api/fs.html)

### Installation

This package is published to GitHub Packages as `@indicio-tech/degov-interpreter-typescript`.
Authenticate with a personal access token that has the `read:packages` scope, then point the scope at the GitHub registry:

```
# .npmrc (do not commit the token)
@indicio-tech:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

```
yarn add @indicio-tech/degov-interpreter-typescript
```

### Releasing

1. Update `version` in `package.json` and merge to `main`.
2. Tag the merge commit `v<version>` and push the tag.
3. The `Release` workflow verifies the tag matches `package.json`, runs tests, build and a production dependency audit, then (after approval of the `release` environment) publishes the tested tarball and creates a GitHub Release with the tarball and its SHA-256 checksum.

## How to use

```Typescript
import promises from "fs/promises"
import ReactStorage from "@react-native-async-storage/async-storage"
import fetch from ""
//first create and instance of the internal storage object for your 
//platform ie (ReactNativeStorage or WebStoreage)

//Mobile
const storage = ReactNativeStorage(ReactStorage)

//Node
const storage = WebStorage(promises)

//Create service instance
const service = DegovService(fetch, storage)
//Initialize the service to resume and previous state
await service.init()

//Use the service object to manage and check dids against the governance files

//Adds a list of files to the service
service.setFiles(["https://someUrl.com", "https://someOtherUrl.com"])
```
   
## Features 

1. Tracking active files
    * Files set as active are the only files dids are checked against
    * You can retrieve a list of all active or inactive files denoted by their url
2. Automatic refetch after ttl(time to live) expirations
    * Every governace file with a valid ttl is automatically refetched when you attempt to use it if it has expired
3. Cached storage
    * Files are cached and only refetched when they have expired
4. Long term storage
    * Files are stored using either node file system or react native storage so that a sense of state can persist between sessions, this means that when you reload an app or restart an agent the files you have used and the active or inactive state they had is pulled from storage instead of refetching them all at start up (expired files are still refetched).  
