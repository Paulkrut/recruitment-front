'use client';

import * as React from 'react';
import { addNote } from '@/store/apps/notes/NotesSlice';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Fab from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSelector, useDispatch } from '@/store/hooks';
import { IconCheck } from '@tabler/icons-react';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


interface Props {
  colors: any[];
}

const AddNotes = ({ colors }: Props) => {
  const { _ } = useLingui();

  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [scolor, setScolor] = React.useState<string>('primary');
  const id = useSelector((state) => state.notesReducer.notes.length + 1);
  const [title, setTitle] = React.useState('');
  const [error, setError] = React.useState('');

  const setColor = (e: string) => {
    setScolor(e);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTitle('');
    setError('');
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setError('');
    
    // Валидация: описание не должно быть пустым
    if (value.trim().length < 3) {
      setError(_(msg`Описание должно содержать минимум 3 символа`));
    }
  };

  return (
    <>
      <Button variant="contained" disableElevation color="primary" onClick={handleClickOpen}>
        Add Note
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Typography variant="h5" mb={2} fontWeight={700}>
            Add New Note
          </Typography>
          <DialogContentText>
            To add new notes please enter your description and choose note colors. and press the
            submit button to add new note.
          </DialogContentText>
          <TextField
            multiline
            rows={5}
            value={title}
            onChange={handleTitleChange}
            margin="normal"
            id="description"
            label="Add Note Description *"
            type="text"
            fullWidth
            size="small"
            variant="outlined"
            error={!!error}
            helperText={error || _(msg`Минимум 3 символа`)}
            placeholder={_(msg`Введите описание заметки...`)}
          />
          <Typography variant="h6" my={2}>
            Choose Color
          </Typography>
          {colors.map((color) => (
            <Fab
              color={color.disp}
              sx={{
                marginRight: '3px',
                transition: '0.1s ease-in',
                scale: scolor === color.disp ? '0.9' : '0.7',
              }}
              size="small"
              key={color.disp}
              onClick={() => setColor(color.disp)}
            >
              {scolor === color.disp ? <IconCheck /> : ''}
            </Fab>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={title.trim().length < 3 || !!error}
            onClick={(e) => {
              e.preventDefault();
              if (title.trim().length < 3) {
                setError(_(msg`Описание должно содержать минимум 3 символа`));
                return;
              }
              dispatch(addNote(id, title, scolor));
              setOpen(false);
              setTitle('');
              setError('');
            }}
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddNotes;
