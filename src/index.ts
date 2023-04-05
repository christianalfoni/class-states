type IState = { status: string };

export type PickState<S extends IState, T extends S["status"] = never> = [
  T
] extends [never]
  ? S
  : S extends { state: T }
  ? S
  : never;

export class States<S extends IState, U extends IState> {
  private _state: S | U;
  private _listeners: Set<(state: S | U, prevState: S | U) => void> = new Set();
  private _isDisposed = false;
  private _transition?: Promise<S>;
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

  set<T extends S | U>(state: T): T {
    if (this._isDisposed) {
      return;
    }

    const prevState = this._state;
    this._state = state;
    this._listeners.forEach((listener) => listener(state, prevState));

    return state;
  }
  transition<T extends U, P extends () => Promise<S>>(
    state: T,
    transition: P
  ): ReturnType<P> {
    this.set(state);

    return (this._transition = transition().then((newState) => {
      delete this._transition;

      this.set(newState);

      return newState;
    }) as ReturnType<P>);
  }
  onTransition(listener: (state: S, prevState: S) => void): () => void {
    if (this._isDisposed) {
      return;
    }

    this._listeners.add(listener);

    return () => {
      this._listeners.delete(listener);
    };
  }
  async awaitTransition<T>(cb: (state: S) => T): Promise<T> {
    const currentState = await (this._transition ||
      Promise.resolve(this._state as S));

    return cb(currentState);
  }

  dispose() {
    this._listeners.clear();
    this._isDisposed = true;
  }
}
