import { States } from ".";

type TestState =
  | {
      status: "CONNECTED";
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

    states.set({ status: "CONNECTED" });

    expect(states.get()).toEqual({ status: "CONNECTED" });
  });
  it("should allow transitioning to new state", async () => {
    const states = new States<TestState, TestTransitionState>({
      status: "DISCONNECTED",
    });

    const transition = states.transition(
      { status: "CONNECTING" },
      async () => ({ status: "CONNECTED" })
    );

    expect(states.get()).toEqual({ status: "CONNECTING" });
    await transition;
    expect(states.get()).toEqual({ status: "CONNECTED" });
  });
  it("should wait transition to new state", async () => {
    const states = new States<TestState, TestTransitionState>({
      status: "DISCONNECTED",
    });

    const transition = states.transition(
      { status: "CONNECTING" },
      async () => ({ status: "CONNECTED" })
    );

    expect(states.get()).toEqual({ status: "CONNECTING" });
    const waitTransition = states.awaitTransition((state) => {
      expect(state).toEqual({ status: "CONNECTED" });

      return "OK";
    });
    await transition;
    expect(states.get()).toEqual({ status: "CONNECTED" });
    const result = await waitTransition;
    expect(result).toBe("OK");
  });
});
