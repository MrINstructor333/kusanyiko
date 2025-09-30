import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import membersReducer from './slices/membersSlice';
import statsReducer from './slices/statsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    stats: statsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;