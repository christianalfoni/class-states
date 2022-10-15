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
  private _listeners: Record<string, Set<(state: S, prevState: S) => void>> =
    {};
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
  match() {
    const state = this._state;
    const matches = arguments[0];
    const _ = arguments[1];

    if (_) {
      return (matches[state.state] || _)(state);
    }

    return matches[state.state](state);
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
  ) {
    let listeners = this._listeners[state];

    if (!listeners) {
      listeners = this._listeners[state] = new Set();
    }

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }
}
