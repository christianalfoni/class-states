# class-states
Manage async complexity with states

## Example

```ts
import { States, PickState } from 'class-states'

type SomeConnectionState =
  {
    state: 'DISCONNECTED'    
  } | {
    state: 'CONNECTING',
    transition: Promise<
      PickState<SomeConnectionState, 'CONNECTED' | 'DISCONNECTED'>
    >
  } | {
    state: 'CONNECTED',
    connection: Connection
  }

class SomeConnection {
  state: States<SomeConnectionState>
  constructor() {
    this.state = new States({
        state: 'DISCONNECTED'
    })
    this.state.onTransition((state, prevState) => {})
    this.state.onTransition('DISCONNECTED', (disconnectedState, prevState) => {})
  }
  private _connect() {
    return this.state.set({
      state: 'CONNECTING',
      transition: someConnectionCreator()
        .then((connection) => ({
          state: 'CONNECTED',
          connection
        }))
        .catch(() => ({
          state: 'DISCONNECTED'
        }))
    })
  }
  async connect() {
    // We first narrow down to a possible "CONNECTED" or "DISCONNECTED"
    // state
    const connectState =  await this.state.matches({
      DISCONNECTED: () => this._connect().transition,
      CONNECTING: ({ transition }) => transition,
      CONNECTED: (state) => state
    })
    
    // Then we use the narrowed state to evaluate what this method
    // returns
    return this.state.matches(connectState, {
      CONNECTED: ({ connection }) => connection,
      DISCONNECTED: () => {
        throw new Error("Could not connect")
      }
    })
  }
  disconnect() {
      this.state.matches({
          CONNECTED: ({ connection }) => {
              connection.dispose()
          },
          _: () => {
              // Do nothing
          }
      })
  }
}
```

## Why?
When you work with complex asynchronous code you have some challenges:

1. Async function/method calls can be called when they are already running, which is easy to ignore or forget to evaluate

2. You have multiple flags that has a relationship (isConnecting, isConnected), but needs to be manually orchestrated, risking invalid states

3. Values can often also be `null` or `undefined` as they are asynchronously initialized

`class-states` gives you a tiny abstraction of explicit states and a `matches` utility which:

1. Forces you to evaluate how any function/method runs when consuming the state of the class

2. Explicit single states instead of manually orchestrating multiple flags

3. Values tied to states are consumed on the specific state, avoiding `null` and `undefined` unions