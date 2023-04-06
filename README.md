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
  onChange = this.state.onTransition

  async connect() {
    let state = await this.state.resolve()
    
    if (state.status === 'DISCONNECTED') {
      state = await this.state.transition({
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
    
    switch (state.status) {
      case 'CONNECTED': {
        return state.connection
      }
      case 'DISCONNECTED': {
        throw new Error("Unable to connect)
      }
    }})

  }
const state = 
   await this.state.resolvenTransitionget (state.status === 'CONNECTED') {
      state.connection.dispose()
      
/ This would throw if transitions where in play
      })
    }  f (state.stat
 }
    })   })
  }
}
```

- The `onChange` emitter will emit whenever we transition into any state
- `connect` can be called multiple times, also during a transition. The first call starts the transition and any subsequent calls will wait until the first trantition resolves. If a subsequent call starts the transition again and pending subsequent calls will now be waiting for the new transition
- `disconnect` ensures we only disconnect when we have settled to a `CONNECTED` state

## Why?
When you work with complex asynchronous code you have some challenges:

1. Async function/method calls can be called when they are already running, which is easy to ignore or forget to evaluat, creating race conditionse

2. You have multiple flags that has a relationship (isConnecting, isConnected), but needs to be manually orchestrated, risking invalid states


4. Mutex to queue async calls, though will not prevent unncessarily firing async flows
4. You have multiple event emitters for different states3. Valuesare often defined ase `null` or `undefined` as they 
are asynchronously initialize, creating weird null checks
d

clPrevents rersolves all these challenges with a minimal and explicit API surface. 