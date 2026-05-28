import { createSlice } from '@reduxjs/toolkit';

const initialForm = {
  name: '',
  serviceId: '',
  priceMonth: '',
  priceYear: '',
  stock: '',
  is_selected: false,
};

const productFormSlice = createSlice({
  name: 'productForm',
  initialState: {
    loading: false,
    error: null,
    previews: [],
    existingImages: [],
    form: initialForm,
  },
  reducers: {
    setProductFormLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProductFormError: (state, action) => {
      state.error = action.payload;
    },
    setProductFormPreviews: (state, action) => {
      state.previews = action.payload;
    },
    addProductFormPreviews: (state, action) => {
      state.previews.push(...action.payload);
    },
    removeProductFormPreview: (state, action) => {
      state.previews = state.previews.filter((_, i) => i !== action.payload);
    },
    setProductFormExistingImages: (state, action) => {
      state.existingImages = action.payload;
    },
    removeProductFormExistingImage: (state, action) => {
      state.existingImages = state.existingImages.filter((_, i) => i !== action.payload);
    },
    updateProductForm: (state, action) => {
      Object.assign(state.form, action.payload);
    },
    resetProductForm: (state) => {
      state.loading = false;
      state.error = null;
      state.previews = [];
      state.existingImages = [];
      state.form = { ...initialForm };
    },
    initProductForm: (state, action) => {
      const { serviceId, existingImages, previews, form } = action.payload;
      state.existingImages = existingImages;
      state.previews = previews;
      state.form = form;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setProductFormLoading, setProductFormError,
  setProductFormPreviews, addProductFormPreviews, removeProductFormPreview,
  setProductFormExistingImages, removeProductFormExistingImage,
  updateProductForm, resetProductForm, initProductForm,
} = productFormSlice.actions;

export default productFormSlice.reducer;
