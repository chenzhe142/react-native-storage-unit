# react-native-storage-unit
A simple AsyncStorage wrapper for React-native.

It can cascading-sync data with each component.

## Version
0.0.1

## License
MIT

## About this repo
This AsyncStorage wrapper was initally created for a React-native offline notebook app.

I created my own implementation, because I want something simple, enough to handle `get/save/update/delete` methods, and save data in `JSON object`.

In addition, I want to automatically sync data change to each component, and trigger each component's re-rendering method.

## Installation
run `npm install react-native-storage-unit --save`

## Usage
The concept of this wrapper is cascading both cached AsyncStorage data and methods
from the app top level to each component.

In order to do this, you should initialize StorageUnit at the entry point of your app:

```javascript
export default class SampleApp extends React.Component {
  constructor() {
    super();

    //this.state.storage is the cache object
    //it has all data from AsyncStorage, and automatically synced with AsyncStorage.
    this.state = {
      storage: {}
    };

    //this storageUnit is a wrapper of AsyncStorage, providing get/save/update/delete methods
    this.storageUnit = new StorageUnit(["storageKey_1", "storageKey_2"], this._updateStorage.bind(this));
    this.storageUnit.fetchData.then((storage) => {
      this.setState({ storage });
    });
  }


  _updateStorage(storage) {
    this.setState({ storage });
  }
}
```
After initializing `this.state.storage` and `this.storageUnit`, you can pass them as props (such as `storageUnit={this.storageUnit}` to different components.

We can cascade any AsyncStorage data change to any of the components, which will do data syncing.

Components can also easily call methods through `this.props.storageUnit` and get AsyncStorage data from `this.props.storage`

## Data structure
```javascript
{
  "your_unique_storage_key_1": {
    storageKey: "your_unique_storage_key_1",
    content: []
  },
  "your_unique_storage_key_2": {
    storageKey: "your_unique_storage_key_1",
    content: [singleObj, singleObj]
  }
}
```

## Methods

###`fetchData()`: `Promise`
fetch all data from AsyncStorage when initalizing

###`saveItem(storage_key, item)`
save an object to AsyncStorage. this method will not override existing data.

`item`:

1. should be stringified JSON object (result of `JSON.stringify(something)`).
2. requires pre-processing. the final object's structure is `{ storageKey: "your_unique_storage_key_1, content: [] }`

### `getItem(storage_key)`
get an object from AsyncStorage.

Alternatively, you can retrieve data by accessing `this.storage`.

### `updateItem(storage_key, singleObj)`
update one existing object.

```javascript
{
  "your_unique_storage_key_2": {
    storageKey: "your_unique_storage_key_1",
    content: [singleObj1, singleObj2]
  }
}
```
you can use `updateItem` when you want to update `singleObj2` to `singleObj3`

### `deleteItem(storage_key, singleObj)`
delete one existing object.

```javascript
{
  "your_unique_storage_key_2": {
    storageKey: "your_unique_storage_key_1",
    content: [singleObj1, singleObj2]
  }
}
```
after calling `deleteItem("your_unique_storage_key_2", singleObj2)`, `singleObj2` will be removed.

```javascript
{
  "your_unique_storage_key_2": {
    storageKey: "your_unique_storage_key_1",
    content: [singleObj1]
  }
}
```

## Todo
1. refactor code
2. use more flexible data structure
3. handle edge cases

## Contributor
Please feel free to create issues & PRs to this repo. Huge thanks!
