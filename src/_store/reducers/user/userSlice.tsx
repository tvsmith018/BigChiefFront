import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/_types/auth/user';

export interface UserState {
  isAuthenticated: boolean;
  data?: User;
}

const initialState: UserState = {
  isAuthenticated: false,
  data: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    storeUser(state, action: PayloadAction<User>) {
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
