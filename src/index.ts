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
  private _transition?: {
    state: U;
    promise: Promise<S>;
  };
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

    if (this._transition) {
      throw new Error(
        "You can not set a new state during transition " +
          this._transition.state.status
      );
    }

    const prevState = this._state;
    this._state = state;
    this._listeners.forEach((listener) => listener(state, prevState));

    return state;
  }
  async transition<T extends U, P extends () => Promise<S>>(
    state: T,
    transition: P
  ) {
    if (this._transition?.state.status === state.status) {
      return this._transition.promise as ReturnType<P>;
    }

    if (this._transition) {
      await this._transition.promise;
    }

    this.set(state);

    this._transition = {
      state,
      promise: transition().then((newState) => {
        delete this._transition;

        this.set(newState);

        return newState;
      }),
    };

    return this._transition.promise as ReturnType<P>;
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
  async whenTransitioned() {
    if (this._transition) {
      return this._transition.promise.then(() => this._state);
    } else {
      return this._state;
    }
  }
  dispose() {
    this._listeners.clear();
    this._isDisposed = true;
  }
}
