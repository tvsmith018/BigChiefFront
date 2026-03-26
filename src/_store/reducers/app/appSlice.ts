import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  isHydrated: boolean;
}

const initialState: AppState = {
  isHydrated: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    markHydrated(state) {
      state.isHydrated = true;
    },
  },
});

export const { markHydrated } = appSlice.actions;
export default appSlice.reducer;