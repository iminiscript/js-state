// BWW State Management Library (embedded for demo)
  class BWWState {
      constructor(initialState = {}) {
          this.state = {};
          this.watchers = new Map();
          this.computedCache = new Map();
          this.computedDeps = new Map();
          this.bindingMap = new Map();
          
          Object.keys(initialState).forEach(key => {
              this.defineReactive(key, initialState[key]);
          });
          
          return new Proxy(this, {
              get(target, prop) {
                  if (prop in target) {
                      return target[prop];
                  }
                  return target.state[prop];
              },
              set(target, prop, value) {
                  if (prop in target) {
                      target[prop] = value;
                  } else {
                      target.setState(prop, value);
                  }
                  return true;
              }
          });
      }
      
      defineReactive(key, value) {
          this.state[key] = value;
          this.watchers.set(key, new Set());
          
          Object.defineProperty(this, key, {
              get() {
                  return this.state[key];
              },
              set(newValue) {
                  this.setState(key, newValue);
              },
              enumerable: true,
              configurable: true
          });
      }
      
      setState(key, value) {
          const oldValue = this.state[key];
          
          if (oldValue === value) return;
          
          if (!(key in this.state)) {
              this.defineReactive(key, value);
              return;
          }
          
          this.state[key] = value;
          this.notifyWatchers(key, value, oldValue);
          this.invalidateComputedDeps(key);
          this.updateBoundElements(key, value);
      }
      
      watch(key, callback, options = {}) {
          if (!this.watchers.has(key)) {
              this.watchers.set(key, new Set());
          }
          
          const watcher = {
              callback,
              immediate: options.immediate || false,
              deep: options.deep || false
          };
          
          this.watchers.get(key).add(watcher);
          
          if (watcher.immediate) {
              callback(this.state[key], undefined);
          }
          
          return () => {
              this.watchers.get(key).delete(watcher);
          };
      }
      
      // Computed properties
      computed(key, computeFn) {
          let isComputing = false;
          const dependencies = new Set();
          
          const computedWatcher = () => {
              if (isComputing) return this.computedCache.get(key);
              
              isComputing = true;
              dependencies.clear();
              
              // Create a proxy to track which properties are accessed during computation
              const trackingProxy = new Proxy(this, {
                  get(target, prop) {
                      if (prop in target.state) {
                          dependencies.add(prop);
                          return target.state[prop];
                      }
                      return target[prop];
                  }
              });
              
              // Calculate value with dependency tracking
              const result = computeFn.call(trackingProxy);
              
              // Store dependencies and result
              this.computedDeps.set(key, dependencies);
              this.computedCache.set(key, result);
              
              isComputing = false;
              return result;
          };
          
          // Define getter for computed property
          Object.defineProperty(this, key, {
              get() {
                  if (!this.computedCache.has(key) || isComputing) {
                      return computedWatcher();
                  }
                  return this.computedCache.get(key);
              },
              enumerable: true,
              configurable: true
          });
          
          // Initial computation
          computedWatcher();
          
          // Set up watchers for all dependencies
          dependencies.forEach(dep => {
              this.watch(dep, () => {
                  // Invalidate cache and recompute
                  this.computedCache.delete(key);
                  const newValue = computedWatcher();
                  
                  // Notify any watchers of this computed property
                  this.notifyWatchers(key, newValue, this.computedCache.get(key));
              });
          });
      }
      
      bindElements() {
          const elements = document.querySelectorAll('[bww-model]');
          
          elements.forEach(element => {
              const key = element.getAttribute('bww-model');
              
              if (!(key in this.state)) {
                  this.defineReactive(key, this.getElementValue(element));
              }
              
              if (!this.bindingMap.has(key)) {
                  this.bindingMap.set(key, new Set());
              }
              this.bindingMap.get(key).add(element);
              
              this.setElementValue(element, this.state[key]);
              this.addElementListeners(element, key);
          });
      }
      
      bind(selector, key, options = {}) {
          const elements = typeof selector === 'string' 
              ? document.querySelectorAll(selector)
              : [selector];
          
          elements.forEach(element => {
              if (!(key in this.state)) {
                  this.defineReactive(key, options.defaultValue || this.getElementValue(element));
              }
              
              if (!this.bindingMap.has(key)) {
                  this.bindingMap.set(key, new Set());
              }
              this.bindingMap.get(key).add(element);
              
              this.setElementValue(element, this.state[key]);
              this.addElementListeners(element, key);
          });
      }
      
      notifyWatchers(key, newValue, oldValue) {
          if (this.watchers.has(key)) {
              this.watchers.get(key).forEach(watcher => {
                  watcher.callback(newValue, oldValue);
              });
          }
      }
      
      invalidateComputedDeps(key) {
          // Find all computed properties that depend on this key
          this.computedDeps.forEach((deps, computedKey) => {
              if (deps.has(key)) {
                  // Clear the cache to force recomputation
                  this.computedCache.delete(computedKey);
                  
                  // Trigger recomputation and notify watchers
                  const newValue = this[computedKey]; // This will trigger the getter
                  
                  // Notify watchers of the computed property
                  if (this.watchers.has(computedKey)) {
                      this.watchers.get(computedKey).forEach(watcher => {
                          watcher.callback(newValue, undefined);
                      });
                  }
              }
          });
      }
      
      updateBoundElements(key, value) {
          if (this.bindingMap.has(key)) {
              this.bindingMap.get(key).forEach(element => {
                  if (this.getElementValue(element) !== value) {
                      this.setElementValue(element, value);
                  }
              });
          }
      }
      
      getElementValue(element) {
          switch (element.type) {
              case 'checkbox':
                  return element.checked;
              case 'radio':
                  return element.checked ? element.value : '';
              case 'number':
              case 'range':
                  return parseFloat(element.value) || 0;
              default:
                  return element.value || element.textContent;
          }
      }
      
      setElementValue(element, value) {
          switch (element.type) {
              case 'checkbox':
                  element.checked = Boolean(value);
                  break;
              case 'radio':
                  element.checked = element.value === String(value);
                  break;
              case 'number':
              case 'range':
                  element.value = value;
                  break;
              default:
                  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                      element.value = value;
                  } else {
                      element.textContent = value;
                  }
          }
      }
      
      addElementListeners(element, key) {
          const updateState = () => {
              this.setState(key, this.getElementValue(element));
          };
          
          switch (element.type) {
              case 'checkbox':
              case 'radio':
                  element.addEventListener('change', updateState);
                  break;
              case 'range':
                  element.addEventListener('input', updateState);
                  element.addEventListener('change', updateState);
                  break;
              default:
                  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                      element.addEventListener('input', updateState);
                  }
          }
      }
      
      reset(key) {
          if (key) {
              delete this.state[key];
              this.watchers.delete(key);
              this.bindingMap.delete(key);
          } else {
              this.state = {};
              this.watchers.clear();
              this.bindingMap.clear();
              this.computedCache.clear();
              this.computedDeps.clear();
          }
      }
      
      toJSON() {
          return JSON.stringify(this.state, null, 2);
      }
  }

  // Initialize the BWW State
  const state = new BWWState({
      sharedValue: 'Hello BWW!',
      userName: 'John Doe',
      userAge: 25,
      isActive: true,
      notifications: false,
      firstName: 'John',
      lastName: 'Doe',
      watchedInput: '',
      counter: 0
  });

  // Setup computed properties
  state.computed('fullName', function() {
      return `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'No name provided';
  });

  // Setup watchers
  state.watch('sharedValue', (newVal) => {
      document.getElementById('sharedDisplay').textContent = newVal || '-';
  }, { immediate: true });

  state.watch('userAge', (newVal) => {
      document.getElementById('ageDisplay').textContent = newVal;
  }, { immediate: true });

  state.watch('fullName', (newVal) => {
      document.getElementById('fullNameDisplay').textContent = newVal;
  }, { immediate: true });

  state.watch('watchedInput', (newVal, oldVal) => {
      const log = document.getElementById('watcherLog');
      if (newVal === '') {
          log.textContent = 'Input cleared!';
      } else {
          log.textContent = `Changed from "${oldVal || 'empty'}" to "${newVal}" (Length: ${newVal.length})`;
      }
  });

  window.state = state;

  // Demo functions
  function updateCounter() {
      state.counter += 1;
  }

  function setRandomData() {
      const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
      const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
      
      state.firstName = names[Math.floor(Math.random() * names.length)];
      state.lastName = surnames[Math.floor(Math.random() * surnames.length)];
      state.userAge = Math.floor(Math.random() * 80) + 18;
      state.counter = Math.floor(Math.random() * 100);
  }

  function resetState() {
      state.sharedValue = '';
      state.userName = '';
      state.userAge = 0;
      state.firstName = '';
      state.lastName = '';
      state.watchedInput = '';
      state.counter = 0;
      state.isActive = false;
      state.notifications = false;
  }

  function clearWatchedInput() {
      state.watchedInput = '';
  }

  function showState() {
      document.getElementById('stateOutput').textContent = state.toJSON();
  }

  // Initialize bindings when page loads
  document.addEventListener('DOMContentLoaded', () => {
      state.bindElements();
      
      // Initial display updates
      showState();
  });
