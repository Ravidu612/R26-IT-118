import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  dashboardBackground: {
    intervalMs: 14000,
    images: [
      { src: '/assets/sri-lankan-tea-estate.png', alt: 'Misty Sri Lankan tea estate in the central highlands' },
      { src: '/assets/sri-lankan-tea-picker.png', alt: 'Tea picker on a Sri Lankan highland tea estate' },
    ],
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDashboardBackground(state, action) {
      state.dashboardBackground = { ...state.dashboardBackground, ...action.payload }
    },
  },
})

export const { setDashboardBackground } = uiSlice.actions
export const selectDashboardBackground = (state) => state.ui.dashboardBackground
export default uiSlice.reducer
