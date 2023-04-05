# class-states
Manage async complexity with states

## Example

```ts
import { States, PickState } from 'class-states'

type SomeState =
  {
    status: 'DISCONNECTED'    
  } | {
    status: 'CONNECTED',
    connection: Connection
  }
  
type SomeTransitionState = {
    status: 'CONNECTING',
  }

class SomeConnection {
  state: States<SomeState, SomeTransitionState>
  constructor() {
    this.state = new States({
        status: 'DISCONNECTED'
    })
    this.state.onTransition((state, prevState) => {})
  }
  private _connect() {
    return this.state.transition({
      status: 'CONNECTING',
    }, async () => {
      try {
        const connection = someConnectionCreator()
        
        return {
          status: 'CONNECTED',
          connection
        }
      } catch {
        return {
          status: 'DISCONNECTED'
        }
      }
    })
  }
  async connect() {
    return this.state.awaitTransitioniasync (state) => {
      if (state.status === 'DISCONNECTED') {
        state = await this._connect()
      }
      
      switch (state.status) {
        case 'CONNECTED': {
          return state.connection
        }
        case 'DISCONNECTED': {
          throw new Error("Unable to connect)
        }
      }
    }  })
    

  }
  async disconnect() {
    return this.state.resolve((state) => {
      if (state.status === 'CONNECTED') {
        state.connection.dispose()
      }
    })   })
  }
}
```

## Why?
When you work with complex asynchronous code you have some challenges:

1. Async function/method calls can be called when they are already running, which is easy to ignore or forget to evaluate

2. You have multiple flags that has a relationship (isConnecting, isConnected), but needs to be manually orchestrated, risking invalid states

3. Values can often also be `null` or `undefined` as they are asynchronously initialized

`class-states` gives you a tiny abstraction of explicit states which:

1. Forces you to evaluate how any function/method runs when consuming the state of the class

2. Explicit states instead of manually orchestrating multiple flags

3. Values tied to states are consumed on the specific state, avoiding `null` and `undefined` unions

4. Async transition of states are safely resolved