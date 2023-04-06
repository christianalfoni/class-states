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
  private state = new States<SomeState, SomeTransitionState>({
    status: 'DISCONNECTED'
  })
  // An event emitter for any state and transition change
  onChange = this.state.onTransition

  async connect() {
    // If we are already CONNECTING it will return the existing
    // promise and not cause a new transition
    const state = await this.state.transition({
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
  
    switch (state.status) {
      case 'CONNECTED': {
        return state.connection
      }
      case 'DISCONNECTED': {
        throw new Error("Unable to connect)
      }
    }})

  }
  as// Ensure any transition has settledconst state = 
    await this.state.whenTransitioned()
    
    if (state.status === 'CONNECTED') {
      state.connection.dispose()
      
      // This would throw if transitions where in play
      this.state.set({
        status: 'DISCONNECTED'
      })
    }  f (state.stat
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

`clPrevents rerunning async logicuate how any function/method runs when consuming the state of the class

2. Explicit states instead of manually orchestrating multiple flags

3. Values tied to states are consumed on the specific state, avoiding `null` and `undefined` unions

4. Async transition of states are safely resolved