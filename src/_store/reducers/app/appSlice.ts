import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  isHydrated: boolean;
  authTransitioning: boolean;
}

const initialState: AppState = {
  isHydrated: false,
  authTransitioning: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    markHydrated(state) {
      state.isHydrated = true;
    },
    setAuthTransitioning(state, action: PayloadAction<boolean>) {
      state.authTransitioning = action.payload;
    },
  },
});

export const { markHydrated, setAuthTransitioning } = appSlice.actions;
export default appSlice.reducer;