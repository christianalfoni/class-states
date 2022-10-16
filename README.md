# class-states
Manage async complexity with states

## Example

```ts
import { States } from 'class-states'

type SomeConnectionState =
  {
    state: 'DISCONNECTED'    
  } | {
    state: 'CONNECTING',
    connectionPromise: Promise<Connection>
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
  }
  async connect() {
    return this.state.matches({
      DISCONNECTED: () => {
        const responsePromise = Promise.resolve('response')
        
        this.state.set({
          state: 'CONNECTING',
          responsePromise
        })
        
        return responsePromise
      },
      CONNECTING: ({ responsePromise }) => responsePromise,
      CONNECTED: ({ response }) => response
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