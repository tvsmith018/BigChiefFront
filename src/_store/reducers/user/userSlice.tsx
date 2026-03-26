import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
  isAuthenticated: boolean;
  data?: any; // replace with User type later
}

const initialState: UserState = {
  isAuthenticated: false,
  data: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    storeUser(state, action: PayloadAction<any>) {
      state.isAuthenticated = true;
      state.data = action.payload;
    },
    removeUser(state) {
      state.isAuthenticated = false;
      state.data = undefined;
    },
  },
});

export const { storeUser, removeUser } = userSlice.actions;
export default userSlice.reducer;