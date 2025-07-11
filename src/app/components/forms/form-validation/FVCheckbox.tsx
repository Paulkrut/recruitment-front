import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import CustomCheckbox from '../theme-elements/CustomCheckbox';

const validationSchema = yup.object({
  color: yup.array().min(1, 'At least one color is required'),
});

const FVCheckbox = () => {
  const formik = useFormik({
    initialValues: {
      color: [],
    },
    validationSchema,
    onSubmit: (values) => {
      alert(values.color);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack>
        <Box mt="-10px" mb={3}>
          <CustomCheckbox
            color="primary"
            value="primary"
            name="color"
            onChange={formik.handleChange}
          />
          <CustomCheckbox
            value="secondary"
            name="color"
            color="secondary"
            onChange={formik.handleChange}
          />
          <CustomCheckbox value="error" name="color" color="error" onChange={formik.handleChange} />
          {formik.errors.color && (
            <FormHelperText error id="standard-weight-helper-text-email-login">
              {' '}
              {formik.errors.color}{' '}
            </FormHelperText>
          )}
        </Box>
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default FVCheckbox;