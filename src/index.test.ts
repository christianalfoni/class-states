import { States } from ".";

type TestState =
  | {
      status: "CONNECTED";
      ref: number;
    }
  | {
      status: "DISCONNECTED";
    };

type TestTransitionState = {
  status: "CONNECTING";
};

describe("States", () => {
  it("should instantiate states", () => {
    const states = new States<TestState, TestTransitionState>({
      status: "DISCONNECTED",
    });

    expect(states.get()).toEqual({ status: "DISCONNECTED" });
  });
  it("should allow changing state", () => {
    const states = new States<TestState, TestTransitionState>({
      status: "DISCONNECTED",
    });

    states.set({ status: "CONNECTED", ref: 0 });

    expect(states.get()).toEqual({ status: "CONNECTED", ref: 0 });
  });
  it("should allow transitioning to new state", async () => {
    const states = new States<TestState, TestTransitionState>({
      status: "DISCONNECTED",
    });

    const transition = states.transition(
      { status: "CONNECTING" },
      async () => ({ status: "CONNECTED", ref: 0 })
    );

    expect(states.get()).toEqual({ status: "CONNECTING" });
    await transition;
    expect(states.get()).toEqual({ status: "CONNECTED", ref: 0 });
  });
  it("should ignore same transition", async () => {
    const states = new States<TestState, TestTransitionState>({
      status: "DISCONNECTED",
    });

    const transition = states.transition(
      { status: "CONNECTING" },
      async () => ({ status: "CONNECTED", ref: 0 })
    );

    expect(states.get()).toEqual({ status: "CONNECTING" });
    const secondTransition = states.transition(
      { status: "CONNECTING" },
      async () => ({
        status: "CONNECTED",
        ref: 1,
      })
    );
    const resultA = await transition;
    expect(resultA).toEqual({ status: "CONNECTED", ref: 0 });
    const resultB = await secondTransition;
    expect(resultB).toEqual({ status: "CONNECTED", ref: 0 });
  });
  it("should wait for current transitions", async () => {
    const states = new States<TestState, TestTransitionState>({
      status: "DISCONNECTED",
    });

    states.transition({ status: "CONNECTING" }, async () => ({
      status: "CONNECTED",
      ref: 0,
    }));

    const state = await states.whenTransitioned();

    expect(state).toEqual({ status: "CONNECTED", ref: 0 });
  });
  it("should throw if setting state during transition", async () => {
    const states = new States<TestState, TestTransitionState>({
      status: "DISCONNECTED",
    });

    states.transition({ status: "CONNECTING" }, async () => ({
      status: "CONNECTED",
      ref: 0,
    }));

    expect(() =>
      states.set({
        status: "DISCONNECTED",
      })
    ).toThrow();
  });
});
