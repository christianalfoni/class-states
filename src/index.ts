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
  private _isDisposed = false;
  constructor(initialState: S) {
    this._state = initialState;
    this.onTransition = this.onTransition.bind(this);
  }
  get isDisposed() {
    return this._isDisposed;
  }
  get() {
    return this._state;
  }
  match<T extends TMatch<S>>(
    matches: T
  ): {
    [K in keyof T]: T[K] extends (...args: any[]) => infer R ? R : never;
  }[keyof T];
  match<T extends TPartialMatch<S>>(
    matches: T
  ):
    | {
        [K in keyof T]: T[K] extends (...args: any[]) => infer R ? R : never;
      }[keyof T];
  match(matches) {
    const state = this._state;

    return matches[state.state] ? matches[state.state](state) : matches._();
  }
  set<T extends S>(state: T): T {
    if (this._isDisposed) {
      return;
    }

    const prevState = this._state;
    this._state = state;
    this._listeners.forEach((listener) => listener(state, prevState));

    return state;
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
    if (this._isDisposed) {
      return;
    }

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
  dispose() {
    this._listeners.clear();
    this._isDisposed = true;
  }
}
