/**
 * class StorageUnit
 *
 * A simple AsyncStorage wrapper, doing get, save, update, and delete
 *
 * The concept of this wrapper is cascading both cached AsyncStorage data and methods
 * from the app top level to each components.
 *
 * In order to do this, you should initialize StorageUnit at the entry point of your app:
 *
 * ## code sample ##
 *    export default class SampleApp extends React.Component {
 *      constructor() {
 *        super();
 *        this.state = {
 *          storage: {}
 *        };
 *        this.storageUnit = new StorageUnit(["storageKey_1", "storageKey_2"], this._updateStorage.bind(this));
 *        this.storageUnit.fetchData.then((storage) => {
 *          this.setState({ storage });
 *        });
 *      }
 *      _updateStorage(storage) {
 *        this.setState({ storage });
 *      }
 *    }
 *
 * ##################
 *
 * In this case, this.storage is the cache object that has all data from AsyncStorage,
 * and it is automatically synced with AsyncStorage.
 *
 * As for this.storageUnit, it is a wrapper of AsyncStorage, providing get/save/update/delete method.
 *
 * After initializing these two objects, you can pass them as props to different scenes and components.
 * We can cascade any AsyncStorage data change to any of the components, achieving the goal of sync-data.
 * Components can easily call these functions and get AsyncStorage data from them.
 *
 *
 * ## data structure ##
 *
 * {
 *  "storageKey_1": {
 *    storageKey: "storageKey_1",
 *    content: []
 *  }
 *  "storageKey_2": {
 *    storageKey: "storageKey_2",
 *    content: []
 *  }
 * }
 *
 * ##################
 *
 * TODO:
 * 1. refactor code
 * 2. use more structured data for storing
 *
 *
 */

import { AsyncStorage } from 'react-native';

export default class StorageUnit {
  /**
   * - constructor
   * @param storage_key_array:
   *          a list of presetted unique storageKeys. The type of storage key is string.
   *            example: ["@storageKeys_username, @storageKeys_settings"]
   *
   *          StorageUnit uses this to find an object in AsyncStorage,
   *          or save it to AsyncStorage.
   *
   *          for example, if you want to save username, you can setup
   *          the storageKey as "@storageKey_username"
   *
   * @param updateStorage_function:
   *           a simple state update function, received from component that wants to store/cache
   *           AsyncStorage data.
   */
  constructor(storage_key_array, updateStorage_function) {
    this.storage_key_array = storage_key_array;
    this.updateStorage_function = updateStorage_function;
    this.initialized = false;
    this.storage = {};

    const self = this;

    // fetchData promise
    this.fetchData = new Promise((resolve, reject) => {
      // init storage when launching
      // *call get from storage function
      self.count = 0;
      for (let i = 0; i < self.storage_key_array.length; i++) {
        self.getFromAsyncStorage(self.storage_key_array[i]).done((response) => {
          self.storage[self.storage_key_array[i]] = {
            storageKey: self.storage_key_array[i],
            content: response
          };
          self.count++;
          if (i === self.storage_key_array.length - 1) {
            self.initialized = true;
            resolve(self.storage);
          }
        });
      }
    });
  }

  async getFromAsyncStorage(storage_key) {
    try {
      let value = await AsyncStorage.getItem(storage_key);
      if (value !== null){
        const response = JSON.parse(value);
        return response;
      }
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }

  async saveToAsyncStorage(storage_key, obj) {
    try {
      AsyncStorage.setItem(storage_key, obj);
      console.log('Saved selection to disk: ' + obj);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }

  getItem(storage_key) {
    if (this.initialized === true) {
      for (let i = 0; i < this.storage_key_array.length; i++) {
        if (this.storage[storage_key]) {
          console.log('StorageUnit: get item success');
          return this.storage[storage_key].content;
        }
      }
    }
    return;
  }

  saveItem(storage_key, item) {
    // save to async
    // add to storage cache
    this.saveToAsyncStorage(storage_key, item).done(() => {
      this.getFromAsyncStorage(storage_key).done((response) => {
        // update this.storage
        this.storage[storage_key] = {
          storageKey: storage_key,
          content: response
        };
        this.updateStorage_function(this.storage);
        console.log('save items');
        console.log(this.storage[storage_key]);
        console.log('StorageUnit: save item success');
      });
    });
  }

  // update an item
  // each item should have an unique id, so that we can figure out which
  //       one to be updated
  // update this.storage first, then update AsyncStorage
  updateItem(storage_key, singleObj) {
    let items = this.storage[storage_key].content;
    if ((singleObj.id !== undefined) && (items[singleObj.id] !== undefined)) {
      items[singleObj.id] = singleObj;
      this.saveToAsyncStorage(storage_key, JSON.stringify(items)).done(() => {
        this.getFromAsyncStorage(storage_key).done((response) => {
          // update this.storage
          this.storage[storage_key] = {
            storageKey: storage_key,
            content: response
          };
          this.updateStorage_function(this.storage);
          console.log('StorageUnit: update item success');
        });
      });
    }
  }

  deleteItem(storage_key, item) {
    // delete item from async storage
    // update storage cache
    let items = this.storage[storage_key].content;
    const position = items.indexOf(item);
    try {
      if ((position >= 0) || (position < items.length)) {
        items.splice(position, 1);
        this.saveToAsyncStorage(storage_key, JSON.stringify(items)).done(() => {
          this.getFromAsyncStorage(storage_key).done((response) => {
            // update this.storage
            this.storage[storage_key] = {
              storageKey: storage_key,
              content: response
            };
            this.updateStorage_function(this.storage);
            console.log('StorageUnit: delete item success');
          })
        })
      }
    } catch (e) {
      console.log('StorageUnit: delete item failed');
      console.log(e);
    }

  }
}
