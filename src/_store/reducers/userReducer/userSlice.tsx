import { createSlice } from '@reduxjs/toolkit'

const name = "UserData";

const inital_state = {
    isAuthenticated:false,
    data: undefined
};

export const userSlice = createSlice({
    name:name,
    initialState:inital_state,
    reducers: { 
        storeUser:(state, payload) => {
            const data = payload.payload;

            state.isAuthenticated = true;
            state.data = data;
        },
        removeUser: (state) => {
            state.isAuthenticated = false;
            state.data = undefined;
        }
    }
})

export const { storeUser, removeUser } = userSlice.actions

export default userSlice.reducer