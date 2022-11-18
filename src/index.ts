type IState = { state: string };

export type TMatch<S extends IState, R = any> = {
  [SS in S["state"]]: (state: S extends { state: SS } ? S : never) => R;
};

export type TPartialMatch<S extends IState, R = any> = {
  [SS in S["state"]]?: (state: S extends { state: SS } ? S : never) => R;
} & {
  _: () => R;
};

export class States<S extends IState> {
  private _state: S;
  private _listeners: Set<(state: S, prevState: S) => void> = new Set();
  constructor(initialState: S) {
    this._state = initialState;
  }
  match<T extends TMatch<S>>(
    matches: T
  ): {
    [K in keyof T]: T[K] extends (...args: any[]) => infer R ? R : never;
  }[keyof T];
  match<T extends TPartialMatch<S>, U>(
    matches: T
  ):
    | {
        [K in keyof T]: T[K] extends (...args: any[]) => infer R ? R : never;
      }[keyof T]
    | U;
  match(matches) {
    const state = this._state;

    return matches[state.state] ? matches[state.state](state) : matches._();
  }
  set(state: S) {
    const prevState = this._state;
    this._state = state;
    this._listeners[state.state]?.forEach((listener) =>
      listener(state, prevState)
    );
  }
  is<T extends S["state"]>(state: T) {
    return this._state.state === state;
  }
  onTransition<T extends S["state"]>(
    state: T,
    listener: (state: S extends { state: T } ? S : never, prevState: S) => void
  ): () => void;
  onTransition(listener: (state: S, prevState: S) => void): () => void;
  onTransition(...args) {
    let listener: (state: S, prevState: S) => void;

    if (typeof args[0] === "string" && typeof args[1] === "function") {
      const state = args[0];

      listener = (currentState, prevState) => {
        if (currentState.state === state) {
          args[1](currentState, prevState);
        }
      };
    } else if (typeof args[0] === "function") {
      listener = args[0];
    } else {
      throw new Error("You are giving the wrong arguments");
    }

    this._listeners.add(listener);

    return () => {
      this._listeners.delete(listener);
    };
  }
}
