
import { useForm, Controller } from 'react-hook-form';

import React, { useEffect, useState, useContext , useCallback} from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import { Typography, Input } from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Unstable_Grid2'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue, grey } from '@mui/material/colors';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import axios from 'axios';
import { useSnackbar } from "notistack";
import { useNavigate } from 'react-router-dom';
import MyContext from '../Context';
import { styled } from '@mui/material/styles'

import { useDropzone } from 'react-dropzone';
import Resizer from 'react-image-file-resizer';

const theme = createTheme({
  palette: {
    primary: {
      
      main: blue[700],
    },
    secondary: {
      
      main: grey[400],
    },
  },
});


const CategoriaButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'none', 
  },
}));

const DropzoneContainer = styled('div')`
  border: 2px dashed #212121;
  border-radius: 4px;
  height:15rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #53585D;
  color: #212121;
  cursor: pointer;


  p {
    margin-top: 1rem;
  }
`;

function FormularioVideos() {
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { forceUpdate } = useContext(MyContext);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

  const volverMain = () => {
    navigate('/');
  }


  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));


  const onDrop = useCallback((droppedFiles) => {
    const updatedFiles = [...acceptedFiles, ...droppedFiles];
    setAcceptedFiles(updatedFiles);
    const file = droppedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        
        const maxWidth = 300;
        const maxHeight = 300;
        let width = image.width;
        let height = image.height;
  
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
  
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);
  
        // Get the resized image as a data URL
        const resizedImageDataUrl = canvas.toDataURL('image/jpeg');
  
        setPreviewImage(resizedImageDataUrl);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }, [acceptedFiles]);
  

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });




  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/categorias');
        const data = await response.json();
        setOptions(data);
     
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const { control, handleSubmit, reset, formState: { errors } } = useForm();


  const onSubmit = async (data) => {
    try {
      
      if (acceptedFiles.length > 0) {
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);
        formData.append('upload_preset',  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );

        const { secure_url } = response.data;
        data.linkImagenVideo = secure_url;
        console.log( data.linkImagenVideo)
      }

      
      const response = await axios.post('http://localhost:3001/videos', data);
      console.log(response.data);
      console.log(response.status);
      enqueueSnackbar('Video agregado correctamente', {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });

      volverMain();
      forceUpdate();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Ocorreu um problema, o vídeo não pôde ser inserido', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    }
  };
 

  const handleDelete = () => {
    setPreviewImage(null);
    setAcceptedFiles([]);
  };


  const iraCategoria = () => {
    // reset()
    // console.log("categoria")
    navigate('/formulariocategoria');
  }


  const resetForm = () => {
    reset(); 
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: "auto", backgroundColor: '#191919', paddingTop: '1rem', paddingBottom: '2rem', minWidth: '320px' }}>
        <Container maxWidth="xl" >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid rowSpacing={5} container sx={{
            }}>
              <Grid item xs={12}  >
                <Typography align='center' variant='h3' color="#ffffff"  > Novo Video</Typography>

              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="titulo"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Titulo es requerido' }}
                  render={({ field }) => (
                    <div>
                      <TextField
                        {...field}
                        sx={{ backgroundColor: '#53585D', color: 'white' }}
                        variant="filled"
                        error={!!errors.titulo}
                        // helperText={fieldState.error?.message}
                        fullWidth
                        label="Título"
                        id="titulo"
                        InputLabelProps={{
                          sx: {},
                        }}
                      />
                      {errors.titulo && (
                        <Typography variant="body2" color="error">
                          {errors.titulo.message}
                        </Typography>
                      )}
                    </div>

                  )}
                />

              </Grid>



              <Grid item xs={12}>
                <Controller
                  name="linkVideo"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Link de video es requerido' }}
                  render={({ field }) => (
                    <div>
                      <TextField
                        {...field}
                        sx={{ backgroundColor: '#53585D', color: 'white' }}
                        variant="filled"
                        error={!!errors.linkVideo}
                        fullWidth
                        label="Link do video"
                        id="linkVideo"
                      />
                      {errors.linkVideo && (
                        <Typography variant="body2" color="error">
                          {errors.linkVideo.message}
                        </Typography>
                      )}
                    </div>
                  )}
                />

              </Grid>

              <Grid item xs={12}>
                <DropzoneContainer {...getRootProps({ className: 'dropzone' })}>
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" />
                  ) : (
                    <p>Arrastrar imagen aquí</p>
                  )}

                </DropzoneContainer>
                <Box sx={{ paddingTop: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* <h4>Fotos</h4> */}
                  <ul>{files}</ul>
                  {acceptedFiles.length > 0 && (
                    <Button variant="contained" color="primary" onClick={handleDelete} >
                      Apagar
                    </Button>
                  )}
                </Box>
              </Grid>


              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-helper-label">Escolha uma categoria</InputLabel>
                  <Controller
                    name="Categoria"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Deve selecionar uma Categoria' }}
                    render={({ field }) => (
                      <div>
                        <Select
                          {...field}
                          variant="outlined"
                          error={!!errors.Categoria}
                          fullWidth
                          sx={{ backgroundColor: '#53585D', color: 'white' }}
                          labelId="demo-simple-select-helper-label"
                          id="demo-simple-select-helper"
                          label="Esconder uma Categoria"
                        >
                          {options.map((option) => (
                            <MenuItem key={option.id} value={option.categoriaNombre}>
                              {option.categoriaNombre}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.Categoria && (
                          <Typography variant="body2" color="error">
                            {errors.Categoria.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                </FormControl>


              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="descripcion"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'A descrição é obrigatória' }}
                  render={({ field }) => (
                    <div>
                      <TextField
                        {...field}
                        error={!!errors.descripcion}
                        sx={{ backgroundColor: '#53585D', color: 'white' }}
                        variant="filled"
                        fullWidth
                        label="Descrição"
                        id="descripcion"
                        multiline rows={5}
                      />
                      {errors.descripcion && (
                        <Typography variant="body2" color="error">
                          {errors.descripcion.message}
                        </Typography>
                      )}
                    </div>
                  )}
                />


              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="codigoSeguridad"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'O código de segurança é obrigatório' }}
                  render={({ field }) => (
                    <div>
                      <TextField
                        {...field}
                        sx={{ backgroundColor: '#53585D', color: 'white' }}
                        variant="filled"

                        error={!!errors.codigoSeguridad}
                        fullWidth
                        label="codigo do seguro"
                        id="codigoSeguridad"
                      />
                      {errors.codigoSeguridad && (
                        <Typography variant="body2" color="error">
                          {errors.codigoSeguridad.message}
                        </Typography>
                      )}


                    </div>
                  )}
                />
              </Grid>

              <Grid item xs={12} direction="row" sx={{ display: 'flex', justifyContent: 'space-between' }} >
                <ButtonGroup variant="contained" size="large" aria-label="small button group"
                  sx={{
                    '& > *': {
                      marginRight: '16px',
                    },
                    '& > *:nth-child(2)': {
                      marginLeft: '32px', 
                    },
                    '@media (max-width:960px)': {
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',

                      '& > *': {
                        marginRight: '0px', 
                      },
                      '& > *:nth-child(2)': {
                        marginLeft: '0px', 
                      },

                    }
                  }}
                >


                  <Button sx={{ width: 150 }} color="primary" type="submit">Salvar</Button>
                  <Button onClick={resetForm} sx={{ width: 150 }} color="secondary">Limpar</Button>

                </ButtonGroup>
                <CategoriaButton onClick={iraCategoria}  sx={{ width: 200 }} variant="contained" size="large" >Nova Categoria</CategoriaButton>

              </Grid>

            </Grid >
          </form>
        </Container>
      </Box>

    </ThemeProvider>
  )
}

export default FormularioVideos